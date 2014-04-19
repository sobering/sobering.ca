do ($ = jQuery, document = document, module = window.Sobering) ->

  class Conway
    canvas:             null
    context:            null
    rows:               null
    cols:               null
    currentGeneration:  null
    cellWidth:          20
    cellHeight:         20
    aliveColor:         '#3C2791'
    deadColor:          'rgb(65,42,156)'

    constructor: ->
      @setupCanvas()
      @rows = Math.ceil(@canvas.height / @cellHeight)
      @cols = Math.ceil(@canvas.width / @cellWidth)
      @seed()
      @tick()

    tick: =>
      @drawGeneration()
      @evolveGeneration()

      setTimeout @tick, 225

    setupCanvas: ->
      container      = $('.conway-container')
      @canvas        = document.createElement 'canvas'
      @canvas.id     = 'conway'
      @canvas.width  = container.width()
      @canvas.height = container.height()
      @context       = @canvas.getContext '2d'

      container.append @canvas

    seed: ->
      @currentGeneration = []

      for row in [0...@rows]
        @currentGeneration[row] = []

        for col in [0...@cols]
          @currentGeneration[row][col] =
            isAlive: Math.random() < 0.4
            row: row
            col: col

    evolveCell: (cell) ->
      evolved =
        isAlive: cell.isAlive
        row: cell.row
        col: cell.col

      neighbors = @countNeighbors cell

      if cell.isAlive or neighbors is 3
        evolved.isAlive = 1 < neighbors < 4

      evolved

    evolveGeneration: ->
      newGeneration = []

      for row in [0...@rows]
        newGeneration[row] = []

        for col in [0...@cols]
          evolved = @evolveCell @currentGeneration[row][col]
          newGeneration[row][col] = evolved

      @currentGeneration = newGeneration

    countNeighbors: (cell) ->
      lowerRowBound = Math.max cell.row - 1, 0
      upperRowBound = Math.min cell.row + 1, @rows - 1
      lowerColBound = Math.max cell.col - 1, 0
      upperColBound = Math.min cell.col + 1, @cols - 1
      neighbors     = 0

      for row in [lowerRowBound..upperRowBound]
        for col in [lowerColBound..upperColBound]
          continue if row is cell.row and col is cell.col
          if @currentGeneration[row][col].isAlive
            neighbors++

      neighbors
  
    drawCell: (col, row, isAlive = false) ->
      if isAlive
        @context.fillStyle = @aliveColor
      else
        @context.fillStyle = @deadColor

      @context.fillRect col * @cellWidth, row * @cellHeight, @cellWidth, @cellHeight

    drawGeneration: ->
      for row in @currentGeneration
        for cell in row
          @drawCell cell.col, cell.row, cell.isAlive

  module.Conway = Conway
