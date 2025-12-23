//Einstellungen für die Bewertung eines Spielfeldes einer bestehenden laage
export const settings = {
	//Gewichtung des großen Spielfeldes vs eines der neun kleinen
	weightBigVsSmall: 5,
	//Mittleresfeld als Endposition meiden?
	avoidCentralPosition: true,
	//Anzahl der Moves die nach vorne gedacht werden soll
	depth: 7,

	//Im nachfolgenden wird jedem Aspekt eine Gewichtung von 1-10 gegeben
	//sowie zum Teil einen maxmalerreichbaren wert (wenn höher ist ein einzelnde Einheit nicht so viel wert)

	//sollen in den Aspekt Bewertungen exponentiell (exponentially) oder linear (linear) steigen pro zusätzlicher Einheit in diesem Aspekt?
	evaluationForm: 'linear',

	//* Eingenommene Felder vs Gegner (Groß)
	occupiedFields: {
		weight: 8,
		maxAssessment: 1,
	},

	//! Gewinnmöglichkeiten vs Gegner (Groß und Klein)
	possibleWinMoves: {
		weight: 10,
		maxAssessment: 2,
	},

	//! Anzahl belegter Felder im spielbaren Bereich vs Gegner (Klein)
	occupiedFieldsSmall: {
		weight: 4,
		maxAssessment: 2,
	},

	//* Kontrolle der Mitte (Groß)
	middleControl: {
		weight: 7,
	},

	//*Kontrolle der Ecken (Groß)
	cornerControl: {
		weight: 4,
		maxAssessment: 3,
	},

	//* Anzahl der Belegten Felder der Mitte vs Gegner (Klein)
	occupiedFieldsMiddle: {
		weight: 5,
		maxAssessment: 2,
	},

	//* Gewonnen / Verlohren
	won: {
		weight: 10,
	},

	//* Nächster Move geschieht in ein Belegtes Feld
	moveIntoOccupied: {
		weight: 5,
	},

	//? Verteilung von Zeichen in jedem Feld
	cellShare: {
		weight: 3,
		maxAssessment: 2,
	},
}
