<script lang="ts">
    import { UltimateTicTacToeBot } from "./UltimateTicTacToeBot";
    
    let board: string[][] = [[],[],[],[],[],[],[],[],[]]
    let overallBoard: string[] = []

    let bot = new UltimateTicTacToeBot(board, overallBoard)
    bot.getBoard()

    board[0][0] = "O"
    bot.getBoard()
    board[0][1] = "X"
</script>