import test from 'node:test';
import assert from 'node:assert';

// -----------------------------------------------------------------------------
// TOURNAMENT BRACKET & ELIMINATION ENGINE TEST SUITE
// -----------------------------------------------------------------------------

function generateTournament(name, size, playerNames) {
  const matches = [];
  if (size === 4) {
    // 2 Semi-finals (Round 1)
    matches.push({
      id: 'm1',
      round: 1,
      matchNumber: 1,
      player1: playerNames[0] || 'Joueur 1',
      player2: playerNames[1] || 'Joueur 2',
      score1: 0,
      score2: 0,
      winner: null,
      isCompleted: false,
    });
    matches.push({
      id: 'm2',
      round: 1,
      matchNumber: 2,
      player1: playerNames[2] || 'Joueur 3',
      player2: playerNames[3] || 'Joueur 4',
      score1: 0,
      score2: 0,
      winner: null,
      isCompleted: false,
    });
    // 1 Finale (Round 2)
    matches.push({
      id: 'm3',
      round: 2,
      matchNumber: 1,
      player1: null,
      player2: null,
      score1: 0,
      score2: 0,
      winner: null,
      isCompleted: false,
    });
  }
  return { name, size, matches, champion: null };
}

function advanceMatch(tournament, matchId, score1, score2) {
  const match = tournament.matches.find((m) => m.id === matchId);
  if (!match) return;

  match.score1 = score1;
  match.score2 = score2;
  match.winner = score1 > score2 ? match.player1 : match.player2;
  match.isCompleted = true;

  if (tournament.size === 4) {
    const finalMatch = tournament.matches.find((m) => m.round === 2);
    if (match.round === 1 && finalMatch) {
      if (match.matchNumber === 1) finalMatch.player1 = match.winner;
      if (match.matchNumber === 2) finalMatch.player2 = match.winner;
    } else if (match.round === 2) {
      tournament.champion = match.winner;
    }
  }
}

test('Tournament Engine - Generates correct 4-player bracket matches', () => {
  const aliases = ['Alice', 'Bob', 'Charlie', 'Dave'];
  const t = generateTournament('Tournoi 42', 4, aliases);

  assert.strictEqual(t.matches.length, 3);
  assert.strictEqual(t.matches[0].player1, 'Alice');
  assert.strictEqual(t.matches[0].player2, 'Bob');
  assert.strictEqual(t.matches[1].player1, 'Charlie');
  assert.strictEqual(t.matches[1].player2, 'Dave');
  assert.strictEqual(t.matches[2].player1, null);
});

test('Tournament Engine - Semi-final winners advance to the Grand Finale', () => {
  const aliases = ['Alice', 'Bob', 'Charlie', 'Dave'];
  const t = generateTournament('Tournoi 42', 4, aliases);

  // Alice beats Bob (5-2) in Semi 1
  advanceMatch(t, 'm1', 5, 2);
  assert.strictEqual(t.matches[0].winner, 'Alice');
  assert.strictEqual(t.matches[2].player1, 'Alice');

  // Dave beats Charlie (5-4) in Semi 2
  advanceMatch(t, 'm2', 4, 5);
  assert.strictEqual(t.matches[1].winner, 'Dave');
  assert.strictEqual(t.matches[2].player2, 'Dave');
});

test('Tournament Engine - Grand Finale winner is crowned champion', () => {
  const aliases = ['Alice', 'Bob', 'Charlie', 'Dave'];
  const t = generateTournament('Tournoi 42', 4, aliases);

  advanceMatch(t, 'm1', 5, 2); // Alice wins Semi 1
  advanceMatch(t, 'm2', 1, 5); // Dave wins Semi 2
  advanceMatch(t, 'm3', 5, 3); // Alice beats Dave (5-3) in Finale

  assert.strictEqual(t.champion, 'Alice');
  assert.strictEqual(t.matches[2].isCompleted, true);
});
