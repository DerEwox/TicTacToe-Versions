export type Player = 'X' | 'O'
export type Cell = Player | '-' | undefined

export class Game {
	grid: Cell[][]
	overallgrid: Cell[]
	player: Player
	lastMoveIndex: number
	won: Cell | '0'

	private readonly winMoves: [number, number, number][] = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	]

	constructor() {
		this.grid = Array.from({ length: 9 }, () => Array<Cell>(9).fill(undefined))
		this.overallgrid = Array<Cell>(9).fill(undefined)
		this.player = Math.random() < 0.5 ? 'X' : 'O'
		this.lastMoveIndex = 99
		this.won = '0'
	}

	private checkwin(): void {
		for (let n = 0; n < 9; n++) {
			for (const [a, b, c] of this.winMoves) {
				const cellA = this.grid[n][a]
				const cellB = this.grid[n][b]
				const cellC = this.grid[n][c]

				if (cellA === 'X' && cellB === 'X' && cellC === 'X') {
					this.overallgrid[n] = 'X'
				} else if (cellA === 'O' && cellB === 'O' && cellC === 'O') {
					this.overallgrid[n] = 'O'
				}
			}

			// Check for tie in this subgrid
			const allDefined = this.grid[n].every((cell) => cell !== undefined)
			if (allDefined && this.overallgrid[n] === undefined) {
				this.overallgrid[n] = '-'
			}
		}
	}

	private checkOverallWin(): void {
		for (const [a, b, c] of this.winMoves) {
			const A = this.overallgrid[a]
			const B = this.overallgrid[b]
			const C = this.overallgrid[c]

			if (A === 'X' && B === 'X' && C === 'X') {
				this.won = 'X'
			} else if (A === 'O' && B === 'O' && C === 'O') {
				this.won = 'O'
			}
		}

		if (this.overallgrid.every((cell) => cell !== undefined) && this.won === '0') {
			this.won = '-'
		}

		if (this.won !== '0') {
			this.lastMoveIndex = 99
		}
	}

	registerMove(selectedgrid: number, cell: number): void {
		if (this.won !== '0') return
		if (this.grid[selectedgrid][cell] !== undefined) return
		if (selectedgrid !== this.lastMoveIndex && this.lastMoveIndex !== 99) return

		this.grid[selectedgrid][cell] = this.player
		this.player = this.player === 'X' ? 'O' : 'X'
		this.lastMoveIndex = cell

		this.checkwin()

		if (this.overallgrid[this.lastMoveIndex] !== undefined) {
			this.lastMoveIndex = 99
		}

		this.checkOverallWin()
	}

	reset(): void {
		this.grid = Array.from({ length: 9 }, () => Array<Cell>(9).fill(undefined))
		this.overallgrid = Array<Cell>(9).fill(undefined)
		this.player = Math.random() < 0.5 ? 'X' : 'O'
		this.lastMoveIndex = 99
		this.won = '0'
	}
}
