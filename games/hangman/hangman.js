// #region game UI
function updateUI() {
    gr = document.querySelector('#guessesRemaining');
    gr.innerText = guessesLeft;
    ltrs = document.querySelectorAll('.word');
    word = getGuessedWord(secretWord, lettersGuessed);
    for (var i = 0; i < word.length; i++) {
        ltrs[i].innerText = word[i];
        ltrs[i].style.display = 'block';
    }
}

function initUI() {
    btns = document.querySelectorAll('.btnLetter');
    for (var i = 0; i < btns.length; i++) {
        btns[i].disabled = false;
    }
    ltrs = document.querySelectorAll('.word');
    for (var i = 0; i < ltrs.length; i++) {
        ltrs[i].innerText = "";
        ltrs[i].style.display = "none";
    }
    msgUI('Try to guess this ' + secretWord.length + ' letter word.')
}

function msgUI(txt) {
    document.querySelector('#msg').innerText = txt;
}

function onUI(btn) {
    if (!gameOver)
        btn.disabled = true;
    processGuess(btn.innerText);
}
// #endregion game UI

// #region settings UI
function settingsError(msg) {
    alert(msg);
    return false;
}
function saveSettings() {
    var ng = document.all.numGuesses.value;

    if (!ng || 0 > ng || 9 < ng) {
        return settingsError("Missed Guesses Allowed must be between 1 and 9");
    }
    lenChks = document.querySelectorAll('#wordLengthsUL li input');
    lens = settings.wordLensSelected.slice(0);
    lenChecked = false;
    for (var i = 0; i < lenChks.length; i++) {
        lenChecked |= (lens[i] = lenChks[i].checked);
    }
    if (!lenChecked) return settingsError("Please select at least one word length.")

    settings.numGuesses = ng;
    settings.wordLensSelected = lens;
    return true;
}
function loadSettings() {
    document.all.numGuesses.value = settings.numGuesses;
    ul = document.all.wordLengthsUL;
    for (var i = ul.children.length; i > 0 ; i--) {
        ul.children[i - 1].remove();
    }
    for (var i = 0; i < settings.wordLengths.length; i++) {
        val = settings.wordLengths[i];
        selected = settings.wordLensSelected[i];
        li = document.createElement('li');
        chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.name = 'wordlen';
        chk.value = val;
        chk.checked = selected;
        li.appendChild(chk);
        sp = document.createElement('span');
        sp.innerText = val;
        li.appendChild(sp);
        ul.appendChild(li);
    }
}
function openSettings() {
    loadSettings();
    document.all.modal.style.display = 'block';
    document.all.settings.style.display = 'block';
}
function closeSettings(save) {
    if (save) {if (!saveSettings()) return false;}
    document.all.modal.style.display = 'none';
    document.all.settings.style.display = 'none';
}
// #endregion settings UI

function showWinner() {
    msgUI('You Win :)');
}
function showLoser() {
    msgUI(secretWord + ' - You Lose :(');
}
function goodGuess(guess) {
    msgUI('Good Guess!');
}

function badGuess(guess) {
    msgUI('Sorry, ' + guess + ' is not in the word.')
}

function loadWords(){
    console.log("Loading word list from file...");
    // wordlist: list of strings
    var wordlist = words.split(' ');
    console.log(wordlist.length + " words loaded.");
    return wordlist;
}

function chooseWord(wordlist){
    return wordList[ Math.trunc( Math.random() * wordList.length ) ].toUpperCase();
}

function isWordGuessed(secretWord, lettersGuessed) {
    /*
    secretWord: string, the word the user is guessing
    lettersGuessed: list, what letters have been guessed so far
    returns: boolean, True if all the letters of secretWord are in lettersGuessed;
      False otherwise
    */
    for (var i = 0; i < secretWord.length; i++) {
        c = secretWord[i];
        if (lettersGuessed.indexOf(c) < 0)
            return false;
    }
    return true;
}
//console.log(isWordGuessed('banjo', ['b','a','n','j']))
function getGuessedWord(secretWord, lettersGuessed) {
    /*
    secretWord: string, the word the user is guessing
    lettersGuessed: list, what letters have been guessed so far
    returns: string, comprised of letters and underscores that represents
      what letters in secretWord have been guessed so far.
    */
    result = [];
    for (var i = 0; i < secretWord.length; i++) {
        var c = secretWord[i];
        if (lettersGuessed.indexOf(c) >= 0)
            result.push(c);
        else
            result.push('_');
    }
    return result;
}
//console.log(getGuessedWord('banjo', ['b','a','n','j']))
var a2z = [] //.join(chr(i + ord('a')) for i in range(26))
for (var i = 0; i < 26; i++) {a2z.push( String.fromCharCode( 'A'.charCodeAt(0) + i) );}
//console.log(a2z);
function getAvailableLetters(lettersGuessed) {
    /*
    lettersGuessed: list, what letters have been guessed so far
    returns: string, comprised of letters that represents what letters have not
      yet been guessed.
    */
    result = [];
    for (var i = 0; i < a2z.length; i++) {
        var c = a2z[i];
        if ( lettersGuessed.indexOf(c) < 0 )
            result.push(c);
    }
    return result;
}
//console.log(getAvailableLetters(['A', 'Z']))
var guessesLeft = 0;
var lettersGuessed = [];
var gameOver = true;
var secretWord = null;
var wordList = null;

function processGuess(guess) {
    /*
    guess: string, the letter to guess.
    */
    if (gameOver) {
        alert(guess + ': The Game Has Ended');
        return;
    }
    lettersGuessed.push(guess)
    if (secretWord.indexOf(guess) >= 0) {
        goodGuess(guess);
        if (isWordGuessed(secretWord, lettersGuessed)) {
            gameOver = true;
            showWinner()
        }
    } else {
        guessesLeft -= 1;
        if (1 > guessesLeft) {
            gameOver = true;
            showLoser()
        } else {
            badGuess(guess);
        }
    }
    updateUI();
}

function chooseWordList() {
    lens = [];
    for (var i = 0; i < settings.wordLensSelected.length; i++) {
        if (settings.wordLensSelected[i]) {
            lens.push(settings.wordLengths[i]);
        }
    }
    n = Math.trunc(Math.random() * lens.length);
    return wordLists[lens[n]];
}

function hangman() {
   /*
    Starts up an interactive game of Hangman.

    * At the start of the game, let the user know how many 
      letters the secretWord contains.

    * Ask the user to supply one guess (i.e. letter) per round.

    * The user should receive feedback immediately after each guess 
      about whether their guess appears in the computers word.

    * After each round, you should also display to the user the 
      partially guessed word so far, as well as letters that the 
      user has not yet guessed.

    Follows the other limitations detailed in the problem write-up.
    */
   lettersGuessed = [];
   guessesLeft = settings.numGuesses;
   gameOver = false;
   wordList = chooseWordList();
   secretWord = chooseWord();
   initUI();
   updateUI();
}

function coallateWordLists(wordList) {
    var result = {};
    for (var i = 0; i < wordList.length; i++) {
        w = wordList[i];
        n = w.length;
        list = result[n];
        if (!list) {
            result[n] = [];
            list = result[n];
        }
        list.push(w);
    }
    return result;
}

function initSettings(wordLists) {
    keys = Object.keys(wordLists);
    for (var i = 0; i < keys.length; i++) {
        if (10 > wordLists[keys[i]].length) continue;
        settings.wordLengths.push(keys[i]);
        settings.wordLensSelected.push(1);
    }
}
var settings = {numGuesses: 8, wordLengths: [], wordLensSelected: []}

var allWords = loadWords();
var wordLists = coallateWordLists(allWords);
initSettings(wordLists);

