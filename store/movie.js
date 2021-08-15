import axios from 'axios'
import _uniqBy from 'lodash/uniqBy'

export default {
  namespaced: true,
  state: () => ({
    movies: [],
    loading: false,
    message: 'Search for the movie title!',
    theMovie: {}
  }),
  getters: {},
  mutations: {
    updateState (state, payload) { // 첫 인수는 state, 두 번째 인수는 함수에서 넘겨받은.. (객체)
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key]
      })
    }
  },
  actions: {
    async searchMovies ({ state, commit }, payload) { // 첫 인수가 context가 들어옴. commit만 쓰려고 분해할당
      if (state.loading) { return } // 엔터키 여러번 눌렀을때 여러면 서버 요청이 가면 안되니까

      // 로딩 시작
      commit('updateState', {
        loading: true,
        message: ''
      })

      try {
        const res = await _fetchMovie(payload)
        const { Search, totalResults } = res.data

        commit('updateState', {
          movies: _uniqBy(Search, 'imdbID')
        })

        const total = parseInt(totalResults, 10) // 정수로, 10진법
        const pageLength = Math.ceil(total / 10)

        // 검색된 총 결과가 2페이지 이상인 경우
        if (pageLength > 1) {
          // 2페이지부터 반복 처리
          for (let page = 2; page <= pageLength; page += 1) {
            // 반복되는 페이지 번호가 요청한 개수보다 크면 요청 종료
            if (page > (payload.number / 10)) { break }
            // 추가 요청 처리
            const res = await _fetchMovie({
              ...payload,
              page
            })
            const { Search } = res.data
            commit('updateState', {
              movies: _uniqBy([
                ...state.movies,
                ...Search
              ], 'imdbID')
            })
          }
        }
      } catch (error) {
        console.log(error)
        commit('updateState', {
          message: error.message,
          movies: []
        })
      } finally {
        // 로딩 종료
        commit('updateState', {
          loading: false
        })
      }
    },
    async searchMovieWithId ({ state, commit }, payload) {
      if (state.loading) { return }

      commit('updateState', {
        loading: true
      })

      try {
        const res = await _fetchMovie({
          id: payload.id
        })
        console.log(res.data)
        commit('updateState', {
          theMovie: res.data
        })
      } catch (error) {
        commit('updateState', {
          message: error.message
        })
      } finally {
        commit('updateState', {
          loading: false
        })
      }
    }
  }
}

// 일반함수로 만들어서 호이스팅ok, 재활용하기 위해 따로 작성. 언더바는 이 파일 안에서만 쓰겠다는 의미 부여.
/*
fetchMovie({
  title: 'frozen'
})
*/
async function _fetchMovie (payload) {
  // CSR: '/api/movie' => '주소/api/movie' 자동으로 이렇게 됨
  // SSR: '/api/movie' => '/api/movie' 이런 주소는 없으니까.. 직접 쓰자
  const url = process.client 
    ? '/api/movie' 
    : `${process.env.CLIENT_URL}/api/movie`
  return await axios.post(url, payload)
}
