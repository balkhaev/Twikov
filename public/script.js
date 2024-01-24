const center = window.innerWidth / 2

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getRandomLeft = (elems) => {
  const randomItemIndex = Math.floor(Math.random() * elems.length)
  const randomElement = elems[randomItemIndex]
  const randomElementWidth = randomElement.clientWidth / 2

  console.log(randomItemIndex)

  return randomElement.offsetLeft - center + randomElementWidth
}

async function init() {
  const { data } = await axios.post("/api")

  var app = new Vue({
    el: "#app",
    data: {
      guns: data.guns,
      armors: data.armors,
      helmets: data.helmets,
      translateXGun: `translateX(0)`,
      translateXArmor: `translateX(0)`,
      translateXHelmet: `translateX(0)`,
    },
    methods: {
      async startRoulette() {
        this.translateXGun = `translateX(-${getRandomLeft(this.$refs.guns)}px)`

        await wait(2000)

        this.translateXArmor = `translateX(-${getRandomLeft(
          this.$refs.armors
        )}px)`

        await wait(2000)

        this.translateXHelmet = `translateX(-${getRandomLeft(
          this.$refs.helmets
        )}px)`
      },
    },
  })
}

init()
