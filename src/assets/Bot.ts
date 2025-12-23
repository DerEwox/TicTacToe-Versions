type coords = { grid: number; cell: number }
type Cell = 'X' | 'O' | '-' | undefined
type gamestatus = {
	grid: Cell[][]
	overallGrid: Cell[]
	lastMove: number
	player: Cell
	firstMove: coords
	rating: number
}
import { settings } from './botSettings'

export class UltimateTicTacToeBot {
	public overallGrid: Cell[]
	public grid: Cell[][]
	public botSymbol: string
	public lastMove: number
	private possibleOutcomes: gamestatus[] = []
	private won = ''

	constructor(
		grid: Cell[][],
		overallGrid: Cell[],
		lastMove: number,
		botSymbol: string = 'O'
	) {
		this.overallGrid = overallGrid
		this.grid = grid
		this.botSymbol = botSymbol
		this.lastMove = lastMove
	}

	public update(grid: Cell[][], overallGrid: Cell[], lastMoveIndex: number) {
		this.grid = grid
		this.overallGrid = overallGrid
		this.lastMove = lastMoveIndex
	}

	private getPossibleMoves(
		grid: Cell[][],
		overallGrid: Cell[],
		lastMoveIndex: number
	): coords[] {
		this.checkWonGrid(grid, overallGrid)
		const out: coords[] = []
		if (lastMoveIndex !== 99) {
			for (let i = 0; i < 9; i++) {
				if (
					grid[lastMoveIndex][i] === undefined &&
					overallGrid[lastMoveIndex] === undefined
				) {
					out.push({ grid: lastMoveIndex, cell: i })
				}
			}
		} else {
			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {
					if (grid[i][j] === undefined && overallGrid[i] === undefined) {
						out.push({ grid: i, cell: j })
					}
				}
			}
		}

		return out
	}

	private winMoves: number[][] = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	]
	private checkWonGrid(grid: Cell[][], overallGrid: Cell[]) {
		for (let n = 0; n < 9; n++) {
			if (overallGrid[n] !== undefined) continue
			for (let i = 0; i < this.winMoves.length; i++) {
				const a = grid[n][this.winMoves[i][0]]
				const b = grid[n][this.winMoves[i][1]]
				const c = grid[n][this.winMoves[i][2]]

				if (a === 'X' && b === 'X' && c === 'X') overallGrid[n] = 'X'
				else if (a === 'O' && b === 'O' && c === 'O') overallGrid[n] = 'O'

				if (
					grid[n][0] !== undefined &&
					grid[n][1] !== undefined &&
					grid[n][2] !== undefined &&
					grid[n][3] !== undefined &&
					grid[n][4] !== undefined &&
					grid[n][5] !== undefined &&
					grid[n][6] !== undefined &&
					grid[n][7] !== undefined &&
					grid[n][8] !== undefined &&
					overallGrid[n] === undefined
				) {
					overallGrid[n] = '-'
				}
			}
		}
	}

	calcOutcomes() {
		const depth = settings.depth
		this.possibleOutcomes = []
		this.possibleOutcomes.push({
			grid: this.grid.map((row) => [...row]),
			overallGrid: [...this.overallGrid],
			lastMove: this.lastMove,
			player: 'O',
			firstMove: { grid: 99, cell: 99 },
			rating: 0,
		})
		let oldOutcomesCount = 1
		let oldOutcomesCountTmp = 0
		let moves: coords[] = []

		for (let d = 0; d < depth; d++) {
			for (let g = 0; g < oldOutcomesCount; g++) {
				moves = this.getPossibleMoves(
					this.possibleOutcomes[g].grid,
					this.possibleOutcomes[g].overallGrid,
					this.possibleOutcomes[g].lastMove
				)
				if (moves.length === 0) continue
				oldOutcomesCountTmp += moves.length
				for (let i = 0; i < moves.length; i++) {
					//Spielstand erstellen
					const out: gamestatus = {
						grid: this.possibleOutcomes[g].grid.map((row) => [...row]),
						overallGrid: [...this.possibleOutcomes[g].overallGrid],
						lastMove: this.possibleOutcomes[g].lastMove,
						player: this.possibleOutcomes[g].player,
						firstMove: this.possibleOutcomes[g].firstMove,
						rating: 0,
					}

					//Move speichern mit dem die Simulation angefangen hat
					if (d === 0) {
						out.firstMove = { grid: moves[i].grid, cell: moves[i].cell }
					}

					//Move als Spieler Machen
					out.grid[moves[i].grid][moves[i].cell] = out.player
					//Spieler ändern
					if (out.player === 'O') {
						out.player = 'X'
					} else {
						out.player = 'O'
					}
					//last Move ändern
					out.lastMove = moves[i].cell

					//Speichern
					this.possibleOutcomes.push(out)
				}
			}
			//alte Spielstände rauslöschen
			this.possibleOutcomes.splice(0, oldOutcomesCount)
			oldOutcomesCount = oldOutcomesCountTmp
			oldOutcomesCountTmp = 0
		}
		console.log(
			oldOutcomesCount,
			'possible Outcomes with ',
			depth,
			'moves thought ahead:',
			this.possibleOutcomes
		)

		//Bewerten
		for (let i = 0; i < this.possibleOutcomes.length; i++) {
			this.possibleOutcomes[i].rating = this.evaluate(this.possibleOutcomes[i])
		}

		const sortedPossibleOutcomes: gamestatus[][] = [[this.possibleOutcomes[0]]]

		//Sortiert Alle possible Outcomes nach first move
		for (let i = 1; i < this.possibleOutcomes.length; i++) {
			let added = false

			for (let j = 0; j < sortedPossibleOutcomes.length; j++) {
				if (
					this.possibleOutcomes[i].firstMove ===
					sortedPossibleOutcomes[j][0].firstMove
				) {
					sortedPossibleOutcomes[j].push(this.possibleOutcomes[i])
					added = true
					break
				}
			}

			if (!added) {
				sortedPossibleOutcomes.push([this.possibleOutcomes[i]])
			}
		}
		//Summe der Ratings für jeden Move
		const ratings: number[] = []
		for (let i = 0; i < sortedPossibleOutcomes.length; i++) {
			ratings.push(0)
			for (let j = 0; j < sortedPossibleOutcomes[i].length; j++) {
				ratings[i] += sortedPossibleOutcomes[i][j].rating
			}
		}
		//Index Höchste Zahl bekommen
		const maxIndex = this.getRandomMaxIndex(ratings)

		console.log('Sortet Possible Outcomes', sortedPossibleOutcomes)
		console.log(
			'Ratings: ',
			ratings,
			'Best Move is: ',
			sortedPossibleOutcomes[maxIndex][0].firstMove
		)
		return sortedPossibleOutcomes[maxIndex][0].firstMove
	}
	private getRandomMaxIndex(ratings: number[]): number {
		let max = ratings[0]
		let maxIndices: number[] = [0]

		for (let i = 1; i < ratings.length; i++) {
			if (ratings[i] > max) {
				max = ratings[i]
				maxIndices = [i] // Neuer höchster Wert gefunden
			} else if (ratings[i] === max) {
				maxIndices.push(i) // Weitere gleiche Höchstwerte
			}
		}

		// Zufälligen Index aus den besten auswählen
		const randomIndex = Math.floor(Math.random() * maxIndices.length)
		return maxIndices[randomIndex]
	}

	private evaluate(gamestate: gamestatus): number {
		const result = {
			occupiedFields: 0,
			possibleWinMovesSmall: 0,
			possibleWinMovesBig: 0,
			occupiedFieldsSmall: 0,
			middleControl: 0,
			cornerControl: 0,
			occupiedFieldsMiddle: 0,
			won: 0,
			overall: 0,
			moveIntoOccupied: 0,
			cellShare: 0,
		}
		//Eingenommene TicTacToe Felder gegenüber des gegners
		{
			const ratio = { O: 0, X: 0, ratio: 0 }
			for (let i = 0; i < 9; i++) {
				if (gamestate.overallGrid[i] === 'O') ratio.O++
				if (gamestate.overallGrid[i] === 'X') ratio.X++
			}
			result.occupiedFields = this.calcRatio(
				ratio,
				settings.occupiedFields.maxAssessment
			)
		}
		//Kontrolle der Mitte
		{
			if (gamestate.overallGrid[4] === 'O') result.middleControl = 10
			if (gamestate.overallGrid[4] === 'X') result.middleControl = -10
		}
		//Kontrolle der Ecken
		{
			const ratio = { O: 0, X: 0, ratio: 0 }
			const cornerpos = [0, 2, 6, 8]
			for (let i = 0; i < cornerpos.length; i++) {
				if (gamestate.overallGrid[cornerpos[i]] === 'O') ratio.O++
				if (gamestate.overallGrid[cornerpos[i]] === 'X') ratio.X++
			}
			result.cornerControl = this.calcRatio(
				ratio,
				settings.cornerControl.maxAssessment
			)
		}
		//Kontrolle der Zellen in der Mitte
		{
			const ratio = { O: 0, X: 0, ratio: 0 }
			for (let i = 0; i < 9; i++) {
				if (gamestate.grid[4][i] === 'O') ratio.O++
				if (gamestate.grid[4][i] === 'X') ratio.X++
			}
			result.occupiedFieldsMiddle = this.calcRatio(
				ratio,
				settings.occupiedFieldsMiddle.maxAssessment
			)
		}
		//Nächster Move geht in ein Belegtes Feld
		{
			if (gamestate.overallGrid[gamestate.firstMove.cell] !== undefined) {
				result.moveIntoOccupied = -10
			}
		}
		//Verteilung der Zeichen in jedem Feld
		{
			let ratio = { O: 0, X: 0, ratio: 0 }
			const tmpresult: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0]
			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {
					if (gamestate.grid[i][j] === 'O') ratio.O++
					if (gamestate.grid[i][j] === 'X') ratio.X++
				}
				tmpresult[i] = this.calcRatio(ratio, settings.cellShare.maxAssessment)
				ratio = { O: 0, X: 0, ratio: 0 }
			}
			let sum = 0
			for (let i = 0; i < 9; i++) {
				sum += tmpresult[i]
			}
			result.cellShare = sum / 9
		}
		//Wurde Gewonnen/Ferlohren?
		{
			let won = ''
			for (let i = 0; i < this.winMoves.length; i++) {
				const a = gamestate.overallGrid[this.winMoves[i][0]]
				const b = gamestate.overallGrid[this.winMoves[i][1]]
				const c = gamestate.overallGrid[this.winMoves[i][2]]

				if (a === 'X' && b === 'X' && c === 'X') won = 'X'
				else if (a === 'O' && b === 'O' && c === 'O') won = 'O'
			}

			if (
				gamestate.overallGrid[0] !== undefined &&
				gamestate.overallGrid[1] !== undefined &&
				gamestate.overallGrid[2] !== undefined &&
				gamestate.overallGrid[3] !== undefined &&
				gamestate.overallGrid[4] !== undefined &&
				gamestate.overallGrid[5] !== undefined &&
				gamestate.overallGrid[6] !== undefined &&
				gamestate.overallGrid[7] !== undefined &&
				gamestate.overallGrid[8] !== undefined &&
				won === '0'
			) {
				won = '-'
			}
			if (won === 'O') result.won = 30
			if (won === 'X') result.won = -30
			if (won === '') result.won = -3
			if (won === '-') result.won = 3
		}
		result.overall = this.calcFinalResult(result)
		return result.overall
	}

	private calcRatio(
		ratio: { O: number; X: number; ratio: number },
		maxAssessment: number
	) {
		let out = 0

		// Vermeide Division durch 0
		if (ratio.X === 0 && ratio.O === 0) {
			out = 0 // beide sind 0 → kein Unterschied
			ratio.ratio = 1 // neutrale Ratio
		} else if (ratio.X === 0) {
			out = 10 // X ist 0 → O dominiert vollständig
			ratio.ratio = Infinity
		} else if (ratio.O === 0) {
			out = -10 // O ist 0 → X dominiert vollständig
			ratio.ratio = Infinity
		} else if (ratio.X < ratio.O) {
			ratio.ratio = ratio.O / ratio.X
			out = (ratio.ratio / maxAssessment) * 10
		} else if (ratio.X === ratio.O) {
			ratio.ratio = 1
			out = 0
		} else {
			ratio.ratio = ratio.X / ratio.O
			out = (ratio.ratio / maxAssessment) * -10
		}
		return out
	}

	private calcFinalResult(results: {
		occupiedFields: number
		possibleWinMovesSmall: number
		possibleWinMovesBig: number
		occupiedFieldsSmall: number
		middleControl: number
		cornerControl: number
		occupiedFieldsMiddle: number
		won: number
		overall: number
		moveIntoOccupied: number
		cellShare: number
	}): number {
		const weightCount =
			settings.occupiedFields.weight +
			2 * settings.possibleWinMoves.weight +
			settings.occupiedFieldsSmall.weight +
			settings.middleControl.weight +
			settings.cornerControl.weight +
			settings.occupiedFieldsMiddle.weight +
			settings.won.weight +
			settings.moveIntoOccupied.weight +
			settings.cellShare.weight +
			6 * settings.weightBigVsSmall
		const sum =
			results.occupiedFields *
				settings.occupiedFields.weight *
				settings.weightBigVsSmall +
			results.possibleWinMovesSmall * settings.possibleWinMoves.weight +
			results.possibleWinMovesBig *
				settings.possibleWinMoves.weight *
				settings.weightBigVsSmall +
			results.occupiedFieldsSmall * settings.occupiedFieldsSmall.weight +
			results.middleControl *
				settings.middleControl.weight *
				settings.weightBigVsSmall +
			results.cornerControl *
				settings.cornerControl.weight *
				settings.weightBigVsSmall +
			results.occupiedFieldsMiddle * settings.occupiedFieldsMiddle.weight +
			results.won * settings.won.weight * settings.weightBigVsSmall +
			results.moveIntoOccupied *
				settings.moveIntoOccupied.weight *
				settings.weightBigVsSmall +
			results.cellShare * settings.cellShare.weight
		return (sum / weightCount) | 0
	}
}
