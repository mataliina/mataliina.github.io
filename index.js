const ROWS = 9
const COLS = 9
const SUBGRID_SIZE = 3
const gameGrid = document.getElementById('game-grid')
const gameBlock = document.getElementById('game-block')
const overlay = document.getElementById('overlay')
const scoreBoard = document.getElementById('score')
const finalScore = document.getElementById('final-score')

let gameGridArray = []

let CELL_WIDTH = 40
let CELL_HEIGHT = 40
let gameGridSize = 369

const screenWidth = window.innerWidth

const gameBlockLeft = '10px'
let gameBlockTop = '450px'
let topSectionHeight = 50
let scoreBoardWidth = 369

if (screenWidth < 380) {
	CELL_WIDTH = screenWidth / 10
	CELL_HEIGHT = CELL_WIDTH
	topSectionHeight = 40
	gameGridSize = CELL_WIDTH * 9 + 9
	gameBlockTop = gameGridSize + topSectionHeight + 30 + 'px'
	scoreBoardWidth = gameGridSize
}

const blockCellStyle = 'width: ' + (CELL_WIDTH - 6) + 'px; height: ' + (CELL_HEIGHT - 6) + 'px;'
const emptyBlockCellStyle = 'width: ' + (CELL_WIDTH - 4) + 'px; height: ' + (CELL_HEIGHT - 4) + 'px;'

let isDragging = false
let score = 0

let currentBlock = getRandomBlock()
let gameBlocks = getRandomBlocks()

function drawGameBlock(blockType) {
	const blockShape = blocks[blockType]
	gameBlock.style.cssText = 'width: ' + (CELL_WIDTH + 2) * blockShape[0].length + 'px; top: ' + gameBlockTop
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
			gameBlock.appendChild(blockCell)
		}
	}
}

function initGameGridArray() {
	gameGridArray = []
	for (let i = 0; i < ROWS; i++) {
		gameGridArray.push(new Array(COLS).fill(0))
	}
}

function getRandomBlock() {
	const blockTypes = Object.keys(blocks)
	return blockTypes[Math.floor(Math.random() * blockTypes.length)]
}

function getRandomBlocks() {
	const blockTypes = Object.keys(blocks)
	return [blockTypes[Math.floor(Math.random() * blockTypes.length)], blockTypes[Math.floor(Math.random() * blockTypes.length)], blockTypes[Math.floor(Math.random() * blockTypes.length)]]
}

function getNewGameBlock() {
	gameBlock.innerHTML = ''
	gameBlock.style.left = gameBlockLeft
	gameBlock.style.top = gameBlockTop
	currentBlock = getRandomBlock()
	console.log('currentBlocks: ', currentBlock)
	drawGameBlock(currentBlock)

	if (isGameOver(currentBlock)) {
		console.log('Game over')
		overlay.classList.remove('display-none')
		finalScore.innerHTML = score
	}
}

let initialX, initialY
let elementX, elementY

function handleEvent(event) {
	event.preventDefault()
	if (event.type === 'mousedown') {
		isDragging = true

		/* muuta siirrettävän palikan tyyliä:
		let selectedGameBlock = event.target.parentNode
		let selectedBlockCells = selectedGameBlock.children
		for(i= 0; i < selectedBlockCells.length; i++){
			selectedBlockCells[i].classList.add("gaps-between")
			selectedBlockCells[i].style.cssText = 'width: ' + (CELL_WIDTH-2) + 'px; height: ' + (CELL_HEIGHT-2) + 'px;'
		}*/
	} else if (event.type === 'touchstart') {
		isDragging = true
		let touch = event.touches[0]

		initialX = touch.clientX
		initialY = touch.clientY

		let elementRect = gameBlock.getBoundingClientRect()
		elementX = elementRect.left
		elementY = elementRect.top
	} else if (event.type === 'mousemove') {
		if (isDragging) {
			const x = event.clientX
			const y = event.clientY
			gameBlock.style.left = x - gameBlock.offsetWidth / 2 + 'px'
			gameBlock.style.top = y - gameBlock.offsetHeight / 2 + 'px'
		}
	} else if (event.type === 'touchmove') {
		if (isDragging) {
			let touch = event.touches[0]

			let deltaX = touch.clientX - initialX
			let deltaY = touch.clientY - initialY

			gameBlock.style.left = elementX + deltaX + 'px'
			gameBlock.style.top = elementY + deltaY + 'px'
		}
	} else if (event.type === 'mouseup' || event.type === 'touchend') {
		if (isDragging) {
			isDragging = false

			const rect = gameBlock.getBoundingClientRect()

			const leftCornerX = rect.left
			const leftCornerY = rect.top

			const cellCol = Math.floor(leftCornerX / (CELL_WIDTH + 1))
			const cellRow = Math.floor((leftCornerY - topSectionHeight) / (CELL_HEIGHT + 1))

			if (isPossiblePosition(currentBlock, cellRow, cellCol)) {
				placeBlockOnGrid(currentBlock, cellRow, cellCol)

				checkCompleted()

				drawGrid()
				getNewGameBlock()
			} else {
				gameBlock.style.left = gameBlockLeft
				gameBlock.style.top = gameBlockTop
			}
		}
	}
}

gameBlock.addEventListener('touchstart', handleEvent)
document.addEventListener(
	'touchstart',
	function (event) {
		event.preventDefault()
	},
	{ passive: false }
)
document.addEventListener('touchmove', handleEvent, { passive: false })
document.addEventListener('touchend', handleEvent)

gameBlock.addEventListener('mousedown', handleEvent)
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

function isGameOver(gameBlock) {
	// TODO: muuta niin että tarkastaa kaikki jäljellä olevat palikat, jos niitä on useita
	for (i = 0; i < ROWS; i++) {
		for (j = 0; j < COLS; j++) {
			if (gameGridArray[i][j] === 0) {
				if (isPossiblePosition(gameBlock, i, j)) return false
			}
		}
	}
	return true
}

function startNewGame() {
	initGameGridArray()
	score = 0
	getNewGameBlock()
	drawGrid()

	overlay.classList.add('display-none')
}


initGameGridArray()

drawGrid()

drawGameBlock(currentBlock)

