<template>
  <div id="dashboard">
    <h1>That's the dashboard!</h1>
    <p>You should only get here if you're authenticated!</p>
    <div v-for='user in users' :key="user.id">
      <p>{{user.email}}</p>
      <p>{{user.password}}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapActions, mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters({
      users: 'getUsers'
    })
  },
  methods: {
    ...mapActions({
      fetchUsers: 'fetchUsers'
    })
  },
  created() {
    this.fetchUsers()
  }
}
</script>


<style scoped>
  h1, p {
    text-align: center;
  }

  p {
    color: red;
  }
</style>