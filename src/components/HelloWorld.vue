<template>
  <div class="table-wrapper">
    <h1>Mission Route Planner</h1>

    <table>
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Item</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(mission, index) in missions" :key="index">
          <td><input v-model="mission.from" /></td>
          <td><input v-model="mission.to" /></td>
          <td><input v-model="mission.item" /></td>
          <td><input v-model.number="mission.amount" type="number" /></td>
          <td><span @click="removeMission(index)">🗑️</span></td>
        </tr>
      </tbody>
    </table>

    <button @click="addMission">Add Mission</button>



    <ul class="list list-inline clr-white">
      <li v-for="(loc, i) in groupedRouteOutput" :key="i">
        <span v-if="i !== 0">➡️</span>{{ loc.location }}
      </li>
    </ul>


    <div v-for="(loc, i) in groupedRouteOutput" :key="i" class="unselectable">
      <h4>{{ loc.location }}</h4>

      <table id="routeOutput">
        <thead>
          <tr>
            <th style="width: 50px;"></th>
            <th width="100">Action</th>
            <th width="200">Item</th>
            <th width="100">Amount</th>
            <th width="260">Authorization Code</th>
          </tr>
        </thead>
        <tbody>

          <tr v-for="(action, j) in loc.actions" :key="j">
            <td>
              <div style="padding-top: 13px">
                <checkbox text="test" />
              </div>
            </td>

            <td>
              {{ action.action }}
            </td>
            <td>
              {{ action.item }}
            </td>
            <td>
              {{ action.amount }}
            </td>
            <td>
              <span class="auth-bar-code no-wrap">89XLK-456VN-LPO1C-AWQ67-ZXU12</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import Checkbox from './Checkbox.vue'

const missions = reactive([
  { from: 'pyro', to: 'everest', item: 'ice', amount: 10 }
])

function addMission() {
  missions.push({ from: '', to: '', item: '', amount: 1 })
}

function removeMission(index) {
  missions.splice(index, 1)
}

const groupedRouteOutput = computed(() => {
  const route = buildRoute()
  const output = []
  const pendingDropoffs = []
  const completedPickups = new Set()

  for (let location of route) {
    output.push({ location, actions: [] })
    const rowsHere = missions.filter(row => row.from === location || row.to === location)

    // Handle pickups
    for (let row of rowsHere) {
      if (row.from === location) {
        output.at(-1).actions.push({
          action: 'pick up',
          from: row.from,
          to: row.to,
          item: row.item,
          amount: row.amount
        })
        completedPickups.add(`${row.from}->${row.to}:${row.item}:${row.amount}`)
      }
    }

    // Handle drop-offs
    for (let row of rowsHere) {
      const tag = `${row.from}->${row.to}:${row.item}:${row.amount}`
      if (row.to === location && completedPickups.has(tag)) {
        output.at(-1).actions.push({
          action: 'drop off',
          from: row.from,
          to: row.to,
          item: row.item,
          amount: row.amount
        })
      } else if (row.to === location) {
        pendingDropoffs.push(row)
      }
    }
  }

  // Second pass for pending drop-offs
  const remainingStops = []
  for (let row of pendingDropoffs) {
    const tag = `${row.from}->${row.to}:${row.item}:${row.amount}`
    if (completedPickups.has(tag)) {
      remainingStops.push(row.to)
    }
  }

  for (let location of remainingStops) {
    output.push({ location, actions: [] })
    for (let row of pendingDropoffs) {
      const tag = `${row.from}->${row.to}:${row.item}:${row.amount}`
      if (row.to === location && completedPickups.has(tag)) {
        output.at(-1).actions.push({
          action: 'drop off',
          from: row.from,
          to: row.to,
          item: row.item,
          amount: row.amount
        })
      }
    }
  }

  return output
})


function buildRoute() {
  const locations = new Set()
  missions.forEach(row => {
    locations.add(row.from)
    locations.add(row.to)
  })
  return Array.from(locations)
}
</script>

<style scoped>
.table-wrapper {
  width: 1000px;
  margin: auto;
}
</style>
