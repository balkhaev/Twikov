class EasyRoulette {
  element
  data

  constructor(options) {
    const element = {}

    element.roulette = document.querySelector(".roulette")
    element.wrapper = element.roulette.querySelector(".roulette-wrapper")
    element.items = element.wrapper.children // life collection

    this.element = element

    const data = {}

    data.totalIterations = parseInt(options.totalIterations) || 3
    data.itemsVisible = parseInt(options.itemsVisible) || 3
    data.duration = parseInt(options.duration) || 1000
    data.easing = options.easing || "linear"
    data.easingStart = options.easingStart || "easeInSine"
    data.easingEnd = options.easingEnd || "easeOutSine"

    // Заблокируем до тех пор, пока не инициализируем
    data.started = true

    this.data = data
  }

  setOptions(options = {}) {
    if (options.totalIterations) {
      this.data.totalIterations = parseInt(options.totalIterations)
    }
    if (options.itemsVisible) {
      this.data.itemsVisible = parseInt(options.itemsVisible)
    }
    if (options.duration) {
      this.data.duration = parseInt(options.duration)
    }
    if (options.easing) {
      this.data.easing = options.easing
    }
    if (options.easingStart) {
      this.data.easingStart = options.easingStart
    }
    if (options.easingEnd) {
      this.data.easingEnd = options.easingEnd
    }

    this.update()
  }

  update() {
    const data = this.data
    const element = this.element

    this.clearError()

    // Remove all clone
    element.wrapper
      .querySelectorAll(".roulette-item-clone")
      .forEach((itemClone) => element.wrapper.removeChild(itemClone))

    data.itemsTotal = element.items.length

    if (!data.itemsTotal) {
      alert("Нет элементов")
      data.error =
        "Нет элементов в рулетке, не возможно продолжать. Некоторые данные отображены в console"
      console.log("data.itemsTotal: " + data.itemsTotal, {
        data,
        items: element.items,
      })

      this.showError()
      return
    }

    // if (data.itemsVisible > data.itemsTotal * 0.5) {
    //   data.error =
    //     "Соотношение видимых элементов ко всем должно быть не больше 1к2. Некоторые данные отображены в console"
    //   console.log(
    //     "data.itemsVisible: " + data.itemsVisible,
    //     "data.itemsTotal: " + data.itemsTotal,
    //     { data, items: element.items }
    //   )

    //   this.showError()
    //   return
    // }

    data.rouletteWidth = element.roulette.getBoundingClientRect().width
    data.wrapperWidth = element.wrapper.getBoundingClientRect().width

    data.itemWidth = data.rouletteWidth / data.itemsVisible

    if (data.itemWidth < 30) {
      data.error =
        "Ширина элементов меньше 30px, элементы практически не видны. Некоторые данные отображены в console"
      console.log(
        "data.itemWidth: " + data.itemWidth,
        "data.rouletteWidth: " + data.rouletteWidth,
        "data.itemsVisible: " + data.itemsVisible,
        { data }
      )

      this.showError()
      return
    }

    data.maximumLeftOffset =
      data.itemWidth * (data.itemsTotal * 2) - data.rouletteWidth
    data.lastAllowedIndex = Math.floor(data.maximumLeftOffset / data.itemWidth)

    const firstOriginalItem = this.getFirstOriginalItem()

    // Add clone
    Array.from(element.items).forEach(function (item, index) {
      item.style.flex = `0 0 ${data.itemWidth}px`
      item.style.minWidth = `${data.itemWidth}px`

      const itemClone = item.cloneNode(true)
      itemClone.classList.add("roulette-item-clone")

      if (index <= data.itemsTotal / 2) {
        element.wrapper.append(itemClone)
      } else {
        firstOriginalItem.before(itemClone)
      }
    })

    // Смещение на первый элемент
    const leftOffset = this.getOffsetForItem(firstOriginalItem, 0.5)
    element.wrapper.style.transform = `translate(-${leftOffset}px, 0)`

    // Снимем блокировку, можем крутить
    data.started = false
    console.log(data.started)
  }

  start(winner) {
    console.log("start")
    if (this.data.started) {
      console.log("started")
      if (this.data.error) {
        this.showError()
      }

      return false
    }

    const data = []
    const item = this.getItemByPosition(winner, false)

    if (!item) {
      this.data.error = "Вы не указали элемент, который должен победить"
      console.log({ winner, item, data })
      this.showError()
      return
    }

    this.data.currentIteration = 0
    this.data.totalSkipped = 0
    this.data.numberWinner = winner
    this.data.started = true

    this.unmarkActiveItem()

    console.clear()
    console.log(`Запустили рулетку`)

    this.roll()
  }

  roll() {
    const { totalIterations, numberWinner, currentIteration, totalSkipped } =
      this.data
    const { items, wrapper } = this.element

    const isStart = currentIteration == 0
    const isEnd = currentIteration == totalIterations

    console.log(`---Круг: ${currentIteration}`)

    // Этого не случится, но что б во время отладки не накосячить
    if (currentIteration > totalIterations) {
      console.log("Пришлось выйти, в чём дело?")

      this.data.started = false
      this.data.totalSkipped = 0
      return false
    }

    if (totalSkipped > 10) {
      console.log("Без вмешательства не обойтись")
      alert("Произошла ошибка, пожалуйста проверьте console")

      this.data.started = false
      this.data.totalSkipped = 0
      return false
    }

    // Текущий элемент по центру
    let {
      position: currentCenterElementPosition,
      index: currentCenterElementIndex,
      element: currentCenterElement,
    } = this.getItemByOffset()
    let movedToStart = false

    const currentCenterElements = this.getItemsByPosition(
      currentCenterElementPosition
    )

    // Если текущий центральный элемент находится во второй половине, вернёмся к началу
    if (currentCenterElementIndex > items.length / 2) {
      currentCenterElement = currentCenterElements[0]

      const leftOffset = this.getOffsetForItem(
        currentCenterElement,
        this.data.offsetRatio
      )
      wrapper.style.transform = `translate(-${leftOffset}px, 0)`

      movedToStart = true

      currentCenterElementIndex =
        EasyRoulette.getElementIndex(currentCenterElement)
    }

    // Пока что укажем, что наш ориентир - это последний оригинальный элемент
    let itemStop = this.getLastOriginalItem()

    // Если это последняя итерация, нам нужно крутить до правильного элемента
    if (isEnd) {
      const winnerElements = this.getItemsByPosition(numberWinner)
      const firsWinnerElementIndex = EasyRoulette.getElementIndex(
        winnerElements[0]
      )

      if (
        firsWinnerElementIndex - currentCenterElementIndex >
        this.data.itemsVisible
      ) {
        itemStop = winnerElements[0]
      } else {
        const lastWinnerElementIndex = EasyRoulette.getElementIndex(
          winnerElements[1]
        )

        if (
          lastWinnerElementIndex - currentCenterElementIndex >
          this.data.itemsVisible
        ) {
          itemStop = winnerElements[1]
        } else {
          // Ещё не придумал...
          console.log("Здесь нужно доработать, попробуем перезапустить...")
          this.data.totalSkipped++

          return this.roll()
        }
      }
    }

    // Координаты для смещения рулетки
    const winnerItemLeftOffset = this.getOffsetForItem(itemStop)
    // Текущие координаты рулетки
    const wrapperPositionLeft = this.getWrapperLeftOffset()
    // Дистанция которую нужно преодолеть
    const distanceToWinnerItem =
      winnerItemLeftOffset - Math.abs(wrapperPositionLeft)

    console.log(`---Посчитали дистанцию (${distanceToWinnerItem}px)`)

    // Если дистанция отрицательная или равно 0, значит мы не всё просчитали
    if (distanceToWinnerItem <= 0) {
      // Ещё не продумал...
      console.log("Здесь тоже нужно доработать, попробуем перезапустить...")
      this.data.totalSkipped++

      return false
    }

    let from = wrapperPositionLeft
    let to = -winnerItemLeftOffset

    // Рулетка не должна смещаться за область видимости
    if (winnerItemLeftOffset > this.data.maximumLeftOffset) {
      // Ещё не продумал...
      console.log("И здесь тоже нужно доработать, попробуем перезапустить...")
      this.data.totalSkipped++

      return false
    }

    const { duration, easing, easingStart, easingEnd } = this.data
    const timeFx = isStart
      ? EasyRoulette.selectEasing(easingStart)
      : isEnd
      ? EasyRoulette.selectEasing(easingEnd)
      : EasyRoulette.selectEasing(easing)

    const step = (now) => (wrapper.style.transform = `translate(${now}px, 0)`)

    const end = () => {
      if (this.data.currentIteration == totalIterations) {
        console.log(`---Завершение анимации`)
        this.addHistory(itemStop)
        itemStop.classList.add("active")

        this.data.started = false
      } else {
        this.data.currentIteration++
        console.log(
          `---Запуск следующего круга (${this.data.currentIteration})`
        )
        this.roll()
      }
    }

    console.log(`---Запуск анимации`)
    EasyRoulette.animate(step, end, from, to, duration, timeFx)
  }

  showError() {
    this.data.error = this.data.error || false

    if (this.data.error) {
      const error = document.createElement("div")
      error.className = "alert alert-danger"
      error.textContent = this.data.error

      this.element.roulette.after(error)

      this.element.error = error
    }
  }

  clearError() {
    if (this.element.error) {
      this.element.error.parentNode.removeChild(this.element.error)
    }
  }

  addHistory(item) {
    this.element.history =
      this.element.history || document.querySelector(".roulette-history")

    const historyItem = item.cloneNode(true)
    historyItem.style = ""
    historyItem.className = "roulette-history-item"
    delete historyItem.dataset.position

    this.element.history.prepend(historyItem)
    this.element.history
      .closest(".section-roulette-history")
      .classList.add("in")
  }

  unmarkActiveItem() {
    const activeItem = this.element.wrapper.querySelector(".active")

    if (activeItem) {
      activeItem.classList.remove("active")
    }
  }

  getItemByOffset(offset = false) {
    if (offset === false) {
      offset = this.getWrapperLeftOffset()
    }

    const { rouletteWidth, itemWidth } = this.data
    const { items } = this.element

    // Дополнительно половина видимой части рулетки
    offset -= rouletteWidth / 2

    // Что бы индекс не был отрицательным числом
    offset = Math.abs(offset)

    // Делим отступ на ширину элемента (получим индекс)
    const index = Math.floor(offset / itemWidth)
    const element = items[index]
    const position = element.dataset.position

    return { element, index, position }
  }

  getWrapperLeftOffset() {
    const { wrapper } = this.element
    const { x } = EasyRoulette.getTranslateValues(wrapper)

    return x * 1
  }
  getOriginalItems(items) {
    items = items || this.element.items
    return Array.from(items).filter(
      (item) => !item.classList.contains("roulette-item-clone")
    )
  }
  getLastOriginalItem() {
    const items = this.getOriginalItems()
    return items[items.length - 1]
  }
  getFirstOriginalItem() {
    const items = this.getOriginalItems()
    return items[0]
  }
  getItemsByPosition(position) {
    const { items } = this.element
    const filtered = Array.from(items).filter(
      (item) => item.dataset.position == position
    )
    return filtered
  }
  getItemByPosition(position, original = true) {
    const items = this.getItemsByPosition(position)
    const filtered = original ? this.getOriginalItems(items) : items
    return filtered[0]
  }
  getOffsetForItem(item, ratio = false) {
    const index = EasyRoulette.getElementIndex(item)
    const { itemWidth, rouletteWidth } = this.data

    let offset = index * itemWidth - rouletteWidth / 2

    const ratioMin = 0.1
    const ratioMax = 0.9

    if (ratio === false || ratio <= ratioMin || ratio >= ratioMax) {
      // Генерируем случайное число от 0.1 до 0.9 (от 10 до 90 и делим на 100, что бы получить 2 числа после запятой)
      ratio =
        EasyRoulette.getRandomInteger(ratioMin * 100, ratioMax * 100) / 100
    }

    this.data.offsetRatio = ratio

    offset += itemWidth * ratio

    return offset
  }

  static getElementIndex(element) {
    return element instanceof HTMLElement
      ? [...element.parentNode.children].indexOf(element)
      : -1
  }

  static getRandomInteger(min, max) {
    return min + Math.random() * (max - min)
  }

  static animate(render, end, from, to, duration, timeFx) {
    let startTime = performance.now()
    requestAnimationFrame(function step(time) {
      let pTime = (time - startTime) / duration
      if (pTime > 1) pTime = 1

      render(from + (to - from) * timeFx(pTime))

      if (pTime < 1) requestAnimationFrame(step)
      else end()
    })
  }

  static selectEasing(name) {
    const list = EasyRoulette.listEasing()
    return list[name] || list["linear"]
  }

  static listEasing() {
    return {
      linear: (t) => t,
      easeInQuad: (t) => t * t,
      easeOutQuad: (t) => t * (2 - t),
      easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => --t * t * t + 1,
      easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

      easeInQuart: (t) => t * t * t * t,
      easeOutQuart: (t) => 1 - --t * t * t * t,
      easeInOutQuart: (t) =>
        t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,

      easeInQuint: (t) => t * t * t * t * t,
      easeOutQuint: (t) => 1 + --t * t * t * t * t,
      easeInOutQuint: (t) =>
        t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,

      easeInSine: (t) => 1 + Math.sin((Math.PI / 2) * t - Math.PI / 2),
      easeOutSine: (t) => Math.sin((Math.PI / 2) * t),
      easeInOutSine: (t) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2,

      easeInElastic: (t) => (0.04 - 0.04 / t) * Math.sin(25 * t) + 1,
      easeOutElastic: (t) => ((0.04 * t) / --t) * Math.sin(25 * t),
      easeInOutElastic: (t) =>
        (t -= 0.5) < 0
          ? (0.02 + 0.01 / t) * Math.sin(50 * t)
          : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1,
    }
  }

  /**
   * https://stackoverflow.com/questions/40710628/how-to-convert-snake-case-to-camelcase-in-my-app#answer-61375162
   * @param str
   * @returns {string}
   */
  static snakeToCamel(str) {
    return str
      .toLowerCase()
      .replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace("-", "").replace("_", "")
      )
  }

  /**
   * https://zellwk.com/blog/css-translate-values-in-javascript/
   * Gets computed translate values
   * @param {HTMLElement} element
   * @returns {Object}
   */
  static getTranslateValues(element) {
    const style = window.getComputedStyle(element)
    const matrix =
      style["transform"] || style.webkitTransform || style.mozTransform

    // No transform property. Simply return 0 values.
    if (matrix === "none" || typeof matrix === "undefined") {
      return {
        x: 0,
        y: 0,
        z: 0,
      }
    }

    // Can either be 2d or 3d transform
    const matrixType = matrix.includes("3d") ? "3d" : "2d"
    const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(", ")

    // 2d matrices have 6 values
    // Last 2 values are X and Y.
    // 2d matrices does not have Z value.
    if (matrixType === "2d") {
      return {
        x: matrixValues[4],
        y: matrixValues[5],
        z: 0,
      }
    }

    // 3d matrices have 16 values
    // The 13th, 14th, and 15th values are X, Y, and Z
    if (matrixType === "3d") {
      return {
        x: matrixValues[12],
        y: matrixValues[13],
        z: matrixValues[14],
      }
    }
  }
}

// Дождёмся загрузки
document.addEventListener("DOMContentLoaded", function () {
  const options = {}

  const inputsSelector = [
    "input-items-visible",
    "input-total-iterations",
    "input-duration",
    "select-easing",
    "select-easing-start",
    "select-easing-end",
  ]

  for (const id of inputsSelector) {
    const element = document.querySelector(`#${id}`)

    if (element && element.value) {
      const id2arr = id.split("-")
      id2arr.shift()

      if (id2arr.length > 1) {
        options[EasyRoulette.snakeToCamel(id2arr.join("-"))] = element.value
      } else {
        options[id2arr[0]] = element.value
      }
    }
  }

  const easeRoulette = new EasyRoulette(options)

  document
    .querySelector(".btn-roulette-start")
    .addEventListener("click", function (e) {
      e.preventDefault()

      const winner = 5
      easeRoulette.start(winner)
    })

  easeRoulette.setOptions()
})
