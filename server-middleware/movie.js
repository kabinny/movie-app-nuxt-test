const express = require('express')
const axios = require('axios')

const { OMDB_API_KEY } = process.env
const app = express()

app.use(express.json())

// 주소/.netlify/functions/movie 로 넷리파이가 만들어줬는데 직접 만든다.
// 주소/api/movie/
app.post('/', async (req, res) => {
  const payload = req.body
  console.log(payload)

  const { title, type, year, page, id } = payload
  const url = id // id가 있을 때, 없을 때
    ? `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}&plot=full`
    : `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${title}&type=${type}&y=${year}&page=${page}`

  try {
    const { data } = await axios.get(url)
    if (data.Error) { // 응답에 Error가 있으면
      // return {
      //   statusCode: 400, // 유효하지 않은 요청
      //   body: data.Error
      // }
      res.status(400).json(data.Error)
    }
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify(data)
    // }
    res.status(200).json(data)
  } catch (error) {
    // return { // 에러 객체에 이런 속성이 있다
    //   statusCode: error.response.status,
    //   body: error.message
    // }
    console.log('error: ', error)
    if (typeof error.messsage === 'string') {
      res
        .status(400)
        .json(error)
    }
    res
      .status(error.response.status)
      .json(error.message)
  }
})

module.exports = app
