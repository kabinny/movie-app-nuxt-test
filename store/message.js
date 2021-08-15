export default {
  namespaced: true,
  state: () => ({
    msg: '7890'
  }),
  getters: {
    reversedMsg (state) {
      return state.msg.split('').reverse().join('')
    }
  },
  mutations: {
    updateMsg (state, newMsg) {
      state.msg = newMsg
    }
  },
  actions: {
    // reverseMsg({ state, getters, commit, dispatch }) { // context를 불러와서 분해 할당
    reverseMsg ({ state, commit }) { // context를 불러와서 분해 할당
      const newMsg = state.msg.split('').reverse().join('')
      commit('updateMsg', newMsg)
      // 모듈 이름 안적으면 현재 모듈 안에서 찾음
      // this.$store.commit('message/updateMsg')
    }
  }
}
