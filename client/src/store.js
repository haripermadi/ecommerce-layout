import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import swal from 'sweetalert2'
Vue.use(Vuex)

// const serverUrl = 'http://ec2-18-222-96-137.us-east-2.compute.amazonaws.com'
const serverUrl = 'http://localhost:3000'
const store = new Vuex.Store({
  state: {
    items: [],
    categories: [
      {
        name: 'Cakes',
        url: './static/images/cakes.jpeg'
      },
      {
        name: 'Cupcakes',
        url: './static/images/cupcakes.jpeg'
      },
      {
        name: 'Chocolates',
        url: './static/images/chocolates.jpeg'
      },
      {
        name: 'Drinks',
        url: 'https://images.pexels.com/photos/109275/pexels-photo-109275.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
      }
    ],
    carts: [],
    total: 0,
    activeUser: {
      userId: localStorage.getItem('userId') || '',
      token: localStorage.getItem('token') || '',
      name: localStorage.getItem('name') || ''
    }
  },
  getters: {
    getItems: function (state) {
      console.log('store:items getter', state.items)
      return state.items
    },
    getCategories: function (state) {
      return state.categories
    },
    getCarts: function (state) {
      return state.carts
    },
    getActiveUser: function (state) {
      return state.activeUser
    }
  },
  mutations: {
    getItems: function (state, payload) {
      state.items = payload
    },
    showCart: function (state, payload) {
      state.carts = payload
    }
  },
  actions: {
    getItems: function (context, payload) {
      console.log('action getitems')
      axios({
        method: 'get',
        url: `${serverUrl}/items`
      }).then(response => {
        console.log('respon get items', response)
        context.commit('getItems', response.data.listItem)
      }).catch(error => {
        console.log(error)
      })
    },
    signUp: function (context, payload) {
      axios({
        method: 'post',
        url: `${serverUrl}/users/signup`,
        data: {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          address: payload.address
        }
      }).then(response => {
        console.log('respon signup', response)
        swal(
          'Welcome!',
          'Sign Up success!',
          'success'
        )
        localStorage.setItem('userId', response.data.data.id)
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('name', response.data.data.name)
        location.reload()
      }).catch(error => {
        console.log(error)
      })
    },
    signIn: function (context, payload) {
      axios({
        method: 'post',
        url: `${serverUrl}/users/signin`,
        data: {
          email: payload.email,
          password: payload.password
        }
      }).then(response => {
        console.log('signin', response)
        swal(
          'Welcome!',
          'Login success!',
          'success'
        )
        localStorage.setItem('userId', response.data.data.id)
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('name', response.data.data.name)
        location.reload()
      }).catch(error => {
        console.log(error)
      })
    },
    addCart: function (context, payload) {
      // let self = this
      axios({
        method: 'post',
        url: `${serverUrl}/transactions`,
        data: payload,
        headers: {
          userid: context.state.activeUser.userId,
          token: context.state.activeUser.token
        }
      }).then(response => {
        console.log('store:response addcart', response)
        swal(
          'Add item success!',
          'Your selection has been added to cart!',
          'success'
        )
        context.dispatch('showCart')
      }).catch(error => {
        console.log(error)
      })
    },
    showCart: function (context, payload) {
      console.log('===stateactive', context)
      axios({
        method: `GET`,
        url: `${serverUrl}/transactions`,
        headers: {
          userid: context.state.activeUser.userId,
          token: context.state.activeUser.token
        }
      }).then(response => {
        console.log('---', response.data)
        context.commit('showCart', response.data.listTransaction)
      }).catch(error => {
        console.log(error)
      })
    },
    removeCart: function (context, payload) {
      let check = confirm('remove item from cart?')
      console.log('data remove', payload)
      if (check === true) {
        axios({
          method: 'DELETE',
          url: `${serverUrl}/transactions/` + payload._id,
          headers: {
            token: context.state.activeUser.token,
            userid: context.state.activeUser.userId
          }
        }).then(response => {
          swal(
            'Remove item success!',
            'Your item has been removed!',
            'success'
          )
          context.dispatch('showCart')
        }).catch(error => {
          // alert('something wrong!')
          console.log(error)
        })
      }
    },
    checkOut: function (context, payload) {
      let data = context.state.carts
      let check = confirm('buy all?')
      if (check === true) {
        for (let i = 0; i < data.length; i++) {
          axios({
            method: 'PUT',
            url: `${serverUrl}/transactions/` + data[i]._id,
            headers: {
              token: context.state.activeUser.token,
              userid: context.state.activeUser.userId
            }
          }).then(response => {
            swal(
              'Success!',
              'Your order has been put in checkout!',
              'success'
            )
            context.dispatch('showCart')
          }).catch(error => {
            // alert('something wrong!')
            console.log(error)
          })
        }
      }
    },
    signInAdmin: function (context, payload) {
      axios({
        method: 'post',
        url: `${serverUrl}/users/signinadmin`,
        data: {
          email: payload.email,
          password: payload.password
        }
      }).then(response => {
        console.log('signin', response.data.admin)
        swal(
          'Welcome!',
          'Sign In success!',
          'success'
        )
        localStorage.setItem('userId', response.data.admin.id)
        localStorage.setItem('token', response.data.admin.token)
        localStorage.setItem('name', 'admin o-tasty')
      }).catch(error => {
        console.log(error)
      })
    },
    uploadFile: function (context, payload) {
      axios({
        method: 'POST',
        url: `${serverUrl}/items/upload`,
        headers: {
          'Content-type': 'multipart/form-data',
          token: context.state.activeUser.token
        },
        data: payload
      }).then(response => {
        console.log('respon upload==', response)
        swal(
          'success!',
          'New item has been added!',
          'success'
        )
        context.dispatch('getItems')
      }).catch(error => {
        console.log(error)
      })
    },
    removeItem: function (context, payload) {
      axios({
        method: 'DELETE',
        url: `${serverUrl}/items/` + payload._id,
        headers: {
          token: context.state.activeUser.token,
          userid: context.state.activeUser.userId
        }
      }).then(response => {
        swal(
          'Remove item success!',
          'Item has been removed!',
          'success'
        )
        context.dispatch('getItems')
      }).catch(error => {
        // alert('something wrong!')
        console.log(error)
      })
    }
  }
})

export default store
