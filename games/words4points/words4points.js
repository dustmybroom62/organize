
const VOWELS = 'AEIOU';
const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ';
const MIN_TILES = 2;
const MAX_TILES = 10;
var _HandSize = 7;

const SCRABBLE_LETTER_VALUES = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1,
    'O': 1, 'P': 3, 'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
}

// #region game UI
function enableReplayUI() {
    document.all.btnReplay.disabled = false;
}

function updateTilesUI() {
    tiles = getTiles(currentHand);
    tilesEl = document.all.tilesDiv;
    newTiles = "";
    for (let i = 0; i < tiles.length; i++) {
        s = document.createElement('span');
        newTiles += buildTileUI(i, tiles[i]);
    }
    tilesEl.innerHTML = newTiles;
}

function disableAllTiles() {
    tilesEl = document.all.tilesDiv;
    for (let i = 0; i < tiles.length; i++) {
        tilesEl.children[i].disabled = true;
    }
}

function updateUI() {
    document.all.totalPointsUI.innerText = totalPoints;
    document.all.numTiles.value = _HandSize;
    updateTilesUI();
}

function initUI() {
    document.all.numTiles.value = _HandSize;
    wordScoresEl = document.all.wordScores;
    childCount = wordScoresEl.children.length;
    for (let i = 0; i < childCount; i++) {
        wordScoresEl.children[0].remove();
    }
    msgUI('');
    // testing
    // newRow = document.createElement('tr');
    // newRow.innerHTML = buildWordScoreUI('testword', 35);
    // wordScores.appendChild(newRow);

    updateUI();
}

function appendWordScoreUI(word, score) {
    wordScoresEl = document.all.wordScores;
    newRow = document.createElement('tr');
    newRow.innerHTML = buildWordScoreUI(word, score);
    wordScoresEl.appendChild(newRow);
}

function cancelWord() {
    currentWord = [];
    updateUI();
    msgUI('');
}

function acceptWord() {
    word = currentWord.join('');
    if (isValidWord(word, currentHand, wordLists)) {
        score = getWordScore(word, _HandSize);
        totalPoints += score;
        appendWordScoreUI(word, score);
        currentHand = updateHand(currentHand, word);
        msgUI(`Accepted: ${word} - ${score} pts.`);
    } else {
        msgUI(`"${word}" is not a valid word.`);
    }
    currentWord = [];
    updateUI();
}

function getHint() {
    currentWord = [];
    word = compChooseWord(currentHand, wordLists, _HandSize);
    if (word) {
        for (let i = 0; i < word.length; i++) {
            currentWord.push(word[i]);
        }
        disableAllTiles();
        points = getWordScore(word, _HandSize);
        msgUI(`Hint: ${word} - ${points} pts.`);
    } else {
        msgUI("No Hint Available.");
        updateUI();
    }
}

// <div style="display: inline-block">
function buildTileUI(idx, letter) {
    points = SCRABBLE_LETTER_VALUES[letter];
    return `<button class="btnLetter" onclick="playTileUI(this, ${idx})"><span class="tileChr">${letter}</span><span class="tilePts">${points}</span></button>`;
}

function buildWordScoreUI(word, score) {
    return  `<td>${word}</td><td style="text-align: right;">${score}</td>`;
}

function msgUI(txt) {
    document.querySelector('#msg').innerText = txt;
}

function collectSettings() {
    let tiles = +document.all.numTiles.value;
    if (!tiles || MIN_TILES > tiles || MAX_TILES < tiles) {
        msgUI(`Tiles must be between ${MIN_TILES} and ${MAX_TILES}.`);
        return false;
    }
    _HandSize = tiles;
    return true;
}

function playTileUI(btn, idx) {
    if (!gameOver)
        btn.disabled = true;
    tiles = getTiles(currentHand);
    currentWord.push(tiles[idx]);
    strWord = currentWord.join('');
    msgUI(`${strWord} - ${getWordScore(strWord, _HandSize)} pts.`);
}
// #endregion game UI

var gameOver = true;
var startHand = {};
var currentHand = {};
var currentWord = [];
var totalPoints = 0;

function replayHand() {
    gameOver = false;
    currentHand = Object.assign({}, startHand);
    currentWord = [];
    totalPoints = 0;
    initUI();
}
function startGame() {
    if (!collectSettings()) return false;
    enableReplayUI();
    startHand = dealHand(_HandSize);
    replayHand();
}

function loadWords() {
    console.log("Loading word list from file...");
    // wordlist: list of strings
    var wordlist = words.split(' ');
    console.log(wordlist.length + " words loaded.");
    return wordlist;
}

function coallateWordLists(wordList) {
    var result = {};
    for (let i = 0; i < wordList.length; i++) {
        let w = wordList[i];
        let n = w.length;
        let list = result[n];
        if (!list) {
            result[n] = [];
            list = result[n];
        }
        list.push(w.toUpperCase());
    }
    return result;
}
var allWords = loadWords();
var wordLists = coallateWordLists(allWords);
console.log(wordLists);

function getFrequencyDict(sequence) {
    /*
    Returns a dictionary where the keys are elements of the sequence
    and the values are integer counts, for the number of times that
    an element is repeated in the sequence.

    sequence: string or list
    return: dictionary
    */
    //# freqs: dictionary (element_type -> int)
    freq = {};
    for (let x = 0; x < sequence.length; x++) {
        c = sequence[x];
        freq[c] = (freq[c] ? freq[c] : 0) + 1;
    }
    return freq
}

function getWordScore(word, n) {
    /*
    Returns the score for a word. Assumes the word is a valid word.

    The score for a word is the sum of the points for letters in the
    word, multiplied by the length of the word, PLUS 50 points if all n
    letters are used on the first turn.

    Letters are scored as in Scrabble; A is worth 1, B is worth 3, C is
    worth 3, D is worth 2, E is worth 1, and so on (see SCRABBLE_LETTER_VALUES)

    word: string (lowercase letters)
    n: integer (HAND_SIZE; i.e., hand size required for additional points)
    returns: int >= 0
    */

    points = 0;
    wordLen = word.length;
    for (let i = 0; i < wordLen; i++) {
        c = word[i];
        points += SCRABBLE_LETTER_VALUES[c]
    }
    points *= wordLen;
    if (n == wordLen) {
        points += 50;
    }

    return points
}
console.log("getWordScore('MOUSE', 7): " + getWordScore('MOUSE', 7));

function getTiles(hand) {
    /*
    Displays the letters currently in the hand.

    For example:
    >>> displayHand({'a':1, 'x':2, 'l':3, 'e':1})
    Should print out something like:
       a x x l l l e
    The order of the letters is unimportant.

    hand: dictionary (string -> int)
    */
   result = [];
   keys = Object.keys(hand);
    for (let i = 0; i < keys.length; i++) {
        letter = keys[i];
        for (let j = 0; j < hand[letter]; j++) {
            result.push(letter);
        }
    }
    return result;
}
console.log(getTiles({M: 2, O: 1, U: 1, S: 1, E: 1}));

function dealHand(n) {
    /*
    Returns a random hand containing n lowercase letters.
    At least n/3 the letters in the hand should be VOWELS.

    Hands are represented as dictionaries. The keys are
    letters and the values are the number of times the
    particular letter is repeated in that hand.

    n: int >= 0
    returns: dictionary (string -> int)
    */
    hand = {}
    numVowels = Math.trunc(n / 3);
    
    for (let i = 0; i < numVowels; i++) {
        x = VOWELS[Math.trunc(Math.random() * VOWELS.length)]
        hand[x] = (hand[x] ? hand[x] : 0) + 1;
    }
    for (let i = numVowels; i < n; i++) {
        x = CONSONANTS[Math.trunc(Math.random() * CONSONANTS.length)]
        hand[x] = (hand[x] ? hand[x] : 0) + 1;
    }
    return hand
}
console.log("dealHand(HAND_SIZE): ");
console.log(dealHand(_HandSize));


function updateHand(hand, word) {
    /*
    Assumes that 'hand' has all the letters in word.
    In other words, this assumes that however many times
    a letter appears in 'word', 'hand' has at least as
    many of that letter in it. 

    Updates the hand: uses up the letters in the given word
    and returns the new hand, without those letters in it.

    Has no side effects: does not modify hand.

    word: string
    hand: dictionary (string -> int)    
    returns: dictionary (string -> int)
    */
    newHand = Object.assign({}, hand);
    remove = getFrequencyDict(word);
    keys = Object.keys(remove);
    for (let i = 0; i < keys.length; i++) {
        c = keys[i];
        newHand[c] -= remove[c];
    }
    return newHand
}
console.log("updateHand({A: 2, B: 2, C: 2}, 'ABCA')")
console.log(updateHand({A: 2, B: 2, C: 2}, 'ABCA'));


function isValidWord(word, hand, wordLists) {
    /*
    Returns True if word is in the wordList and is entirely
    composed of letters in the hand. Otherwise, returns False.

    Does not mutate hand or wordList.
   
    word: string
    hand: dictionary (string -> int)
    wordList: list of lowercase strings
    */
    letterCount = getFrequencyDict(word);
    keys = Object.keys(letterCount);
    for (let i = 0; i < keys.length; i++) {
        c = keys[i];
        if (letterCount[c] > (hand[c] ? hand[c] : 0)) {
            return false;
        }
    }
    if (wordLists && 0 > wordLists[word.length].indexOf(word)) {
        return false;
    }
    return true;
}
console.log("isValidWord('MOUSE', {M:1, O:1, U:1, S:1, E:1}, wordLists)");
console.log(isValidWord('MOUSE', {M:1, O:1, U:1, S:1, E:1}, wordLists));
console.log("isValidWord('MOUSE', {D:1, O:1, U:1, S:1, E:1})");
console.log(isValidWord('MOUSE', {D:1, O:1, U:1, S:1, E:1}));

function calculateHandlen(hand) {
    /*
    Returns the length (number of letters) in the current hand.
    
    hand: dictionary (string-> int)
    returns: integer
    */
    result = 0;
    v = Object.values(hand);
    for (let i = 0; i < v.length; i++) {
        result += v[i];
    }
    return result;
}
console.log("calculateHandlen({M:1, O:2, U:1, S:1, E:1})");
console.log(calculateHandlen({M:1, O:2, U:1, S:1, E:1}));

function compChooseWord(hand, wordLists, n) {
    /*
    Given a hand and a wordList, find the word that gives 
    the maximum value score, and return it.

    This word should be calculated by considering all the words
    in the wordList.

    If no words in the wordList can be made from the hand, return null.

    hand: dictionary (string -> int)
    wordList: list (string)
    n: integer (HAND_SIZE; i.e., hand size required for additional points)

    returns: string or null
    */
    //# Create a new variable to store the maximum score seen so far (initially 0)
    bestScore = 0;
    //# Create a new variable to store the best word seen so far (initially null)  
    bestWord = null
    handLen = calculateHandlen(hand);
    for (let i = handLen; i > 0; i--) {
        bestUpdated = false; // reset each wordList
        wordList = wordLists[i];
        //# For each word in the wordList
        for (let j = 0; j < wordList.length; j++) {
            word = wordList[j];
            //# If you can construct the word from your hand
            if (isValidWord(word, hand)) {
                // if all letters used, no need to search any further
                if (i == handLen) return word;
                //# find out how much making that word is worth
                score = getWordScore(word, n)
                //# If the score for that word is higher than your best score
                if (score > bestScore) {
                    //# update your best score, and best word accordingly
                    bestScore = score
                    bestWord = word
                    bestUpdated = true;
                }
            }
        }
        // if a best exists but no better in the last wordList then return best.
        if (!bestUpdated && null != bestWord) return bestWord;
    }
    //# return the best word you found.
    return bestWord
}
console.log("compChooseWord({M:1, O:1, U:1, S:1, E:1, X:2}, wordLists, HAND_SIZE)");
console.log(compChooseWord({M:1, O:1, U:1, S:1, E:1, X:2}, wordLists, _HandSize));
console.log("compChooseWord({H:1, Q:1, L:1, B:1, O:1, A:1, R:1}, wordLists, HAND_SIZE)");
console.log(compChooseWord({H:1, Q:1, L:1, B:1, O:1, A:1, R:1}, wordLists, _HandSize));

