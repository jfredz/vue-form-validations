import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'
import axios from './axios-auth'
import mainAxios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    users: []
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.token,
      state.userId = userData.id
    },
    mutateUsers(state, users) {
      state.users = users
    },
    logOut(state) {
      state.idToken = null
      state.userId = null
      localStorage.removeItem('expiresIn')
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.replace('/signin')
    }
  },
  actions: {
    signup({ commit, dispatch }, authData) {
      axios.post('/signupNewUser?key=AIzaSyClwLw8Z9PtxdqGsoWSwmWAAwqPRHFHdxQ', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(res => {
          console.log(res)
          commit('authUser', {
            token: res.data.idToken,
            id: res.data.localId
          })
          const now = new Date() 
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000)
          localStorage.setItem('token', res.data.idToken)
          localStorage.setItem('expiresIn', expirationDate)
          localStorage.setItem('userId', res.data.localId)
          dispatch('storeUser', authData)
          dispatch('setLogoutTimer', res.data.expiresIn)
        })
        .catch(error => console.log(error))
    },
    login({ commit, dispatch }, authData) {
      axios.post('/verifyPassword?key=AIzaSyClwLw8Z9PtxdqGsoWSwmWAAwqPRHFHdxQ', {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
        .then(res => {
          commit('authUser', {
            token: res.data.idToken,
            id: res.data.localId
          })
          const now = new Date() 
          const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000)
          localStorage.setItem('token', res.data.idToken)
          localStorage.setItem('expiresIn', expirationDate)
          localStorage.setItem('userId', res.data.localId)
          dispatch('setLogoutTimer', res.data.expiresIn)
        })
        .catch(error => console.log(error))
    },
    setLogoutTimer({ dispatch }, expirationTime) {
      setTimeout(() => {
        dispatch('logOut')
      }, expirationTime * 1000)
    },
    logOut({ commit }) {
      commit('logOut')
    },
    storeUser({state}, userData) {
      if(!state.idToken) return
      mainAxios.post('/users.json' + '?auth=' + state.idToken, userData)
        .then(res => console.log(res))
        .catch(error => console.log(error))
    },
    fetchUsers({ commit, state }) {
      if(!state.idToken) return
      mainAxios.get('/users.json' + '?auth=' + state.idToken)
        .then(result => {
          const data = result.data
          const users = []
          for(let key in data) {
            let user = data[key]
            user.id = key
            users.push(user)
          }
          commit('mutateUsers', users)
        })
        .catch(error => console.log(error))
    },
    tryAutoLogin ({ commit }) {
      const token = localStorage.getItem('token')
      if(!token) {
        return
      }
      const expirationDate = localStorage.getItem('expiresIn')
      const now = new Date()
      if(now >= expirationDate) {
        return 
      }
      const userId = localStorage.getItem('userId')
      commit('authUser', {
        token: token,
        id: userId
      })
    }
  },
  getters: {
    getUsers: (state) => state.users,
    isAuthenticated: (state) => state.idToken !== null
  }
})