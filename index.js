const ROWS = 9
const COLS = 9
const SUBGRID_SIZE = 3

const gameGrid = document.getElementById('game-grid')
const gameBlockArea = document.getElementById('game-block-area')
const gameBlock0 = document.getElementById('game-block-0')
const gameBlock1 = document.getElementById('game-block-1')
const gameBlock2 = document.getElementById('game-block-2')
const theBlocks = document.querySelectorAll('.block')
const gameBlockContainers = document.querySelectorAll('.game-block-container')
const overlay = document.getElementById('overlay')
const scoreBoard = document.getElementById('score')
const finalScore = document.getElementById('final-score')
const newGameBtn = document.getElementById('newGameBtn')

let gameGridArray = []

let CELL_WIDTH = 40
let CELL_HEIGHT = 40
let gameGridSize = 369

const screenWidth = window.innerWidth

let topSectionHeight = 50
let scoreBoardWidth = 369

gameBlockContainers.forEach(function (div) {
	div.style.cssText = 'width: ' + gameGridSize / 3 + 'px;'
})

if (screenWidth < 380) {
	CELL_WIDTH = screenWidth / 10
	CELL_HEIGHT = CELL_WIDTH
	topSectionHeight = 40
	gameGridSize = CELL_WIDTH * 9 + 9

	scoreBoardWidth = gameGridSize
}
let gameBlockTop = gameGridSize + topSectionHeight + 30
const gameBlockLeft = 10

let blockCellWidth = CELL_WIDTH - 14
let blockCellHeight = CELL_HEIGHT - 14
const blockCellStyle = 'width: ' + blockCellWidth + 'px; height: ' + blockCellHeight + 'px;'
const emptyBlockCellStyle = 'width: ' + (blockCellWidth + 2) + 'px; height: ' + (blockCellHeight + 2) + 'px;'

let isDragging = false
let score = 0

let currentGameBlocks = getRandomBlocks()

function drawGameBlock(blockType, blockNr) {
	const blockShape = blocks[blockType]

	theBlocks[blockNr].style.cssText = 'width: ' + (blockCellWidth + 2) * blockShape[0].length + 'px; height: ' + (blockCellHeight + 2) * blockShape.length + 'px; top: ' + gameBlockTop + 'px; left: ' + (blockNr * (gameGridSize / 3) + 10) + 'px;'

	for (let i = 0; i < blockShape.length; i++) {
		for (let j = 0; j < blockShape[i].length; j++) {
			const blockCell = document.createElement('div')
			if (blockShape[i][j] === 1) {
				blockCell.classList.add('block-cell')
				blockCell.style.cssText = blockCellStyle
			} else {
				blockCell.classList.add('empty-block-cell')
				blockCell.style.cssText = emptyBlockCellStyle
			}

			theBlocks[blockNr].appendChild(blockCell)
			theBlocks[blockNr].setAttribute('data-type', blockType)
		}
	}
}

function drawGameBlocks(currentGameBlocks) {
	currentGameBlocks.forEach((block, index) => {
		drawGameBlock(block, index)
	})
}

function initGameGridArray() {
	gameGridArray = []
	for (let i = 0; i < ROWS; i++) {
		gameGridArray.push(new Array(COLS).fill(0))
	}
}

function getRandomBlocks() {
	const blockTypes = Object.keys(blocks)
	return [blockTypes[Math.floor(Math.random() * blockTypes.length)], blockTypes[Math.floor(Math.random() * blockTypes.length)], blockTypes[Math.floor(Math.random() * blockTypes.length)]]
}

function getNewGameBlocks() {
	theBlocks.forEach(function (block) {
		block.innerHTML = ''
	})
	currentGameBlocks = getRandomBlocks()
	drawGameBlocks(currentGameBlocks)
}

/* for touch events */
let initialX, initialY
let elementX, elementY
let startScrollY
let moveable

function handleEvent(event) {
	if (event.type === 'mousedown') {
		isDragging = true
		moveable = this
		let elementRect = moveable.getBoundingClientRect()
		elementX = elementRect.left
		elementY = elementRect.top
		/* Change the style of the movable block:*/
		let selectedBlockCells = moveable.children
		for (i = 0; i < selectedBlockCells.length; i++) {
			selectedBlockCells[i].style.margin = '5px'
		}
		//The width of the block (number of cells)
		let blockType = moveable.getAttribute('data-type')
		let blockArray = blocks[blockType]
		let blockwidth = blockArray[0].length
		moveable.style.width = blockwidth * (blockCellWidth + 12) + 'px'
	} else if (event.type === 'touchstart') {
		event.preventDefault()
		isDragging = true
		moveable = this
		let touch = event.touches[0]

		initialX = touch.clientX
		initialY = touch.clientY

		let elementRect = moveable.getBoundingClientRect()
		elementX = elementRect.left
		elementY = elementRect.top

		/* Change the style of the movable block:*/
		let selectedBlockCells = moveable.children
		for (i = 0; i < selectedBlockCells.length; i++) {
			selectedBlockCells[i].style.margin = '5px'
		}
		//The width of the block (number of cells)
		let blockType = moveable.getAttribute('data-type')
		let blockArray = blocks[blockType]
		let blockwidth = blockArray[0].length
		moveable.style.width = blockwidth * (blockCellWidth + 12) + 'px'
	} else if (event.type === 'mousemove') {
		if (isDragging) {
			const x = event.clientX
			const y = event.clientY
			let newTop = y - moveable.offsetHeight / 2 - 60
			if (newTop < 0) newTop = 0
			moveable.style.left = x - moveable.offsetWidth / 2 + 'px'
			moveable.style.top = newTop + 'px'
		}
	} else if (event.type === 'touchmove') {
		if (isDragging) {
			event.preventDefault()
			let touch = event.touches[0]

			let deltaX = touch.clientX - initialX
			let deltaY = touch.clientY - initialY
			// Calculate the new top position
			let newTop = elementY + deltaY - 60

			// Ensure the element doesn't move above the top edge of the screen
			if (newTop < 0) {
				newTop = 0
			}
			// Set the new top position
			moveable.style.top = newTop + 'px'
			moveable.style.left = elementX + deltaX + 'px'
			//moveable.style.top = elementY + deltaY + 'px'
		} else {
			if (event.touches[0].clientY < startScrollY) {
				event.preventDefault()
			}
		}
	} else if (event.type === 'mouseup' || event.type === 'touchend') {
		if (isDragging) {
			event.preventDefault()
			isDragging = false

			const rect = moveable.getBoundingClientRect()

			const leftCornerX = rect.left
			const leftCornerY = rect.top

			const cellCol = Math.floor(leftCornerX / (CELL_WIDTH + 1))
			const cellRow = Math.floor((leftCornerY - topSectionHeight) / (CELL_HEIGHT + 1))
			let blockType = moveable.getAttribute('data-type')
			if (isPossiblePosition(blockType, cellRow, cellCol)) {
				placeBlockOnGrid(blockType, cellRow, cellCol)
				checkCompleted()
				currentGameBlocks.splice(currentGameBlocks.indexOf(blockType), 1)
				moveable.innerHTML = ''

				drawGrid()

				if (currentGameBlocks.length < 1) getNewGameBlocks()

				theBlocks.forEach((block) => {
					block.classList.remove('disabled-block')
				})

				let possibleBlocks = getPossibleBlocks(currentGameBlocks)
				console.log('possibleBlocks: ', possibleBlocks)

				theBlocks.forEach((block) => {
					if (!possibleBlocks.includes(block.getAttribute('data-type'))) block.classList.add('disabled-block')
				})

				if (isGameOver(currentGameBlocks)) {
					console.log('Game over')
					overlay.classList.remove('display-none')
					finalScore.innerHTML = score
				}
			} else {
				moveable.style.left = elementX + 'px'
				moveable.style.top = elementY + 'px'
				/* Change back the style of the movable block:*/
				let selectedBlockCells = moveable.children
				for (i = 0; i < selectedBlockCells.length; i++) {
					selectedBlockCells[i].style.margin = '0px'
				}
				//The width of the block (number of cells)
				let blockArray = blocks[blockType]
				let blockwidth = blockArray[0].length
				moveable.style.width = (blockCellWidth + 2) * blockwidth + 'px'
			}
		}
	}
}

theBlocks.forEach(function (block) {
	block.addEventListener('touchstart', handleEvent)
	block.addEventListener('mousedown', handleEvent)
})
document.addEventListener('touchstart', function (event) {
	startScrollY = event.touches[0].clientY
})
document.addEventListener('touchmove', handleEvent, { passive: false })
document.addEventListener('touchend', handleEvent)

document.addEventListener('mousemove', handleEvent)
document.addEventListener('mouseup', handleEvent)

function isPossiblePosition(blockType, startRow, startCol) {
	const blockShape = blocks[blockType]
	for (let i = 0; i < blockShape.length; i++) {
		for (let j = 0; j < blockShape[i].length; j++) {
			if (blockShape[i][j] === 1) {
				const row = startRow + i
				const col = startCol + j
				if (row < 0 || row >= ROWS || col < 0 || col >= COLS || gameGridArray[row][col] != 0) {
					return false
				}
			}
		}
	}
	return true
}

function placeBlockOnGrid(blockType, startRow, startCol) {
	const blockShape = blocks[blockType]
	for (let i = 0; i < blockShape.length; i++) {
		for (let j = 0; j < blockShape[i].length; j++) {
			if (blockShape[i][j] === 1) {
				const row = startRow + i
				const col = startCol + j
				if (row >= 0 && row < ROWS && col >= 0 && col < COLS && gameGridArray[row][col] === 0) {
					gameGridArray[row][col] = blockType
					score++
				}
			}
		}
	}
}

function drawGrid() {
	gameGrid.innerHTML = ''
	gameGrid.style.cssText = 'width: ' + gameGridSize + 'px; height: ' + gameGridSize + 'px;'
	for (let i = 0; i < gameGridArray.length; i++) {
		for (let j = 0; j < gameGridArray[i].length; j++) {
			let bgColor = 'light-bg'
			if (((i < 3 || i > 5) && (j < 3 || j > 5)) || (i > 2 && i < 6 && j > 2 && j < 6)) bgColor = 'dark-bg'
			const cell = document.createElement('div')

			if (gameGridArray[i][j] != 0) bgColor = 'reserved-cell'

			cell.style.cssText = 'width: ' + (CELL_WIDTH - 1) + 'px; height: ' + (CELL_WIDTH - 1) + 'px;'

			cell.classList.add('game-cell', bgColor)
			gameGrid.appendChild(cell)
		}
	}
	scoreBoard.style.cssText = 'width: ' + scoreBoardWidth + 'px; height: ' + topSectionHeight + 'px'
	scoreBoard.innerHTML = score
}

function checkCompleted() {
	let completedRows = []
	let completedColumns = []
	let completedGrids = []
	// check rows
	for (let row = 0; row < gameGridArray.length; row++) {
		let isRowCompleted = true
		for (let col = 0; col < gameGridArray[row].length; col++) {
			if (gameGridArray[row][col] === 0) {
				isRowCompleted = false
				break
			}
		}
		if (isRowCompleted) completedRows.push(row)
	}
	// check columns
	for (let col = 0; col < gameGridArray[0].length; col++) {
		let isColumnCompleted = true
		for (let row = 0; row < gameGridArray.length; row++) {
			if (gameGridArray[row][col] === 0) {
				isColumnCompleted = false
				break
			}
		}
		if (isColumnCompleted) completedColumns.push(col)
	}
	// check grids
	for (let row = 0; row < ROWS; row += SUBGRID_SIZE) {
		for (let col = 0; col < COLS; col += SUBGRID_SIZE) {
			if (isSubgridCompleted(row, col)) {
				completedGrids.push([row, col])
			}
		}
	}

	if (completedRows.length > 0) clearCompletedRows(completedRows)
	if (completedColumns.length > 0) clearCompletedColumns(completedColumns)
	if (completedGrids.length > 0) clearCompletedSubgrids(completedGrids)
}

function isSubgridCompleted(startRow, startCol) {
	for (let row = startRow; row < startRow + SUBGRID_SIZE; row++) {
		for (let col = startCol; col < startCol + SUBGRID_SIZE; col++) {
			if (gameGridArray[row][col] === 0) {
				return false
			}
		}
	}
	return true
}

function clearCompletedRows(rows) {
	rows.forEach((row) => {
		for (let col = 0; col < gameGridArray[row].length; col++) {
			gameGridArray[row][col] = 0
			score += 2
		}
	})
}

function clearCompletedColumns(columns) {
	columns.forEach((col) => {
		for (let row = 0; row < gameGridArray.length; row++) {
			gameGridArray[row][col] = 0
			score += 2
		}
	})
}

function clearCompletedSubgrids(completedGrids) {
	completedGrids.forEach((compGrid) => {
		for (let row = compGrid[0]; row < compGrid[0] + SUBGRID_SIZE; row++) {
			for (let col = compGrid[1]; col < compGrid[1] + SUBGRID_SIZE; col++) {
				gameGridArray[row][col] = 0
				score += 2
			}
		}
	})
}

function getPossibleBlocks(gameBlocks) {
	console.log('haetaan maholliset näistä: ', gameBlocks)
	let possibleBlocks = []
	gameBlocks.forEach(function (block) {
		let isPossible = false
		for (i = 0; i < ROWS; i++) {
			for (j = 0; j < COLS; j++) {
				if (isPossiblePosition(block, i, j)) {
					isPossible = true
					break
				}
			}
		}
		if (isPossible) possibleBlocks.push(block)
	})
	return possibleBlocks
}

function isGameOver(gameBlocks) {
	let isOver = true
	gameBlocks.forEach(function (block) {
		for (i = 0; i < ROWS; i++) {
			for (j = 0; j < COLS; j++) {
				if (isPossiblePosition(block, i, j)) {
					isOver = false
					break
				}
			}
		}
	})
	return isOver
}

function startNewGame() {
	location.reload()
	/*
	initGameGridArray()
	score = 0
	getNewGameBlock()
	drawGrid()
	overlay.classList.add('display-none')
	*/
}

initGameGridArray()

drawGrid()

getRandomBlocks()
drawGameBlocks(currentGameBlocks)
