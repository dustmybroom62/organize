// #region game UI
function updateUI() {
    let gr = document.querySelector('#guessesRemaining');
    gr.innerText = guessesLeft;
    let ltrs = document.querySelectorAll('.word');
    word = getGuessedWord(secretWord, lettersGuessed);
    for (let i = 0; i < word.length; i++) {
        ltrs[i].innerText = word[i];
        ltrs[i].style.display = 'block';
    }
}

function initUI() {
    let btns = document.querySelectorAll('.btnLetter');
    for (let i = 0; i < btns.length; i++) {
        btns[i].disabled = false;
        btns[i].className = 'btnLetter';
    }
    let ltrs = document.querySelectorAll('.word');
    for (let i = 0; i < ltrs.length; i++) {
        ltrs[i].innerText = "";
        ltrs[i].style.display = "none";
    }
    msgUI('Try to guess this ' + secretWord.length + ' letter word.')
}

function msgUI(txt) {
    document.querySelector('#msg').innerText = txt;
}

function onUI(btn) {
    if (!gameOver) {
        btn.disabled = true;        
        btn.classList.add('btnDisabled');
    }
    let goodGuess = processGuess(btn.innerText);
    if (!goodGuess) {
        btn.classList.add('btnBadGuess');
    }
}
// #endregion game UI

// #region settings UI
function settingsError(msg) {
    alert(msg);
    return false;
}
function saveSettings() {
    let ng = document.all.numGuesses.value;

    if (!ng || 0 > ng || 9 < ng) {
        return settingsError("Missed Guesses Allowed must be between 1 and 9");
    }
    let lenChks = document.querySelectorAll('#wordLengthsUL li input');
    let lens = settings.wordLensSelected.slice(0);
    let lenChecked = false;
    for (let i = 0; i < lenChks.length; i++) {
        lenChecked |= (lens[i] = lenChks[i].checked);
    }
    if (!lenChecked) return settingsError("Please select at least one word length.")

    settings.numGuesses = ng;
    settings.wordLensSelected = lens;
    return true;
}
function loadSettings() {
    document.all.numGuesses.value = settings.numGuesses;
    let ul = document.all.wordLengthsUL;
    for (let i = ul.children.length; i > 0 ; i--) {
        ul.children[i - 1].remove();
    }
    settings.wordLengths.sort((a, b) => b - a);
    for (let i = 0; i < settings.wordLengths.length; i++) {
        let val = settings.wordLengths[i];
        let selected = settings.wordLensSelected[i];
        let li = document.createElement('li');
        let chk = document.createElement('input');
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
function wordLenSelectAll(checked) {
    let chks = document.getElementsByName('wordlen');
    for (let i = 0; i < chks.length; i++) {
        chks[i].checked = checked;
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
    let wordlist = words.split(' ');
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
    for (let i = 0; i < secretWord.length; i++) {
        let c = secretWord[i];
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
   let result = [];
    for (let i = 0; i < secretWord.length; i++) {
        let c = secretWord[i];
        if (lettersGuessed.indexOf(c) >= 0)
            result.push(c);
        else
            result.push('_');
    }
    return result;
}
//console.log(getGuessedWord('banjo', ['b','a','n','j']))
var a2z = [] //.join(chr(i + ord('a')) for i in range(26))
for (let i = 0; i < 26; i++) {a2z.push( String.fromCharCode( 'A'.charCodeAt(0) + i) );}
//console.log(a2z);
function getAvailableLetters(lettersGuessed) {
    /*
    lettersGuessed: list, what letters have been guessed so far
    returns: string, comprised of letters that represents what letters have not
      yet been guessed.
    */
   let result = [];
    for (let i = 0; i < a2z.length; i++) {
        let c = a2z[i];
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
    let correct = true;
    if (gameOver) {
        alert(guess + ': The Game Has Ended');
        return correct;
    }
    lettersGuessed.push(guess)
    if (secretWord.indexOf(guess) >= 0) {
        goodGuess(guess);
        if (isWordGuessed(secretWord, lettersGuessed)) {
            gameOver = true;
            showWinner()
        }
    } else {
        correct = false;
        guessesLeft -= 1;
        if (1 > guessesLeft) {
            gameOver = true;
            showLoser()
        } else {
            badGuess(guess);
        }
    }
    updateUI();
    return correct;
}

function chooseWordList() {
    let lens = [];
    for (let i = 0; i < settings.wordLensSelected.length; i++) {
        if (settings.wordLensSelected[i]) {
            lens.push(settings.wordLengths[i]);
        }
    }
    let n = Math.trunc(Math.random() * lens.length);
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
    let result = {};
    for (let i = 0; i < wordList.length; i++) {
        let w = wordList[i];
        let n = w.length;
        let list = result[n];
        if (!list) {
            result[n] = [];
            list = result[n];
        }
        list.push(w);
    }
    return result;
}

function initSettings(wordLists) {
    let keys = Object.keys(wordLists);
    for (let i = 0; i < keys.length; i++) {
        if (10 > wordLists[keys[i]].length) continue;
        settings.wordLengths.push(keys[i]);
        settings.wordLensSelected.push(1);
    }
}
var settings = {numGuesses: 8, wordLengths: [], wordLensSelected: []}

var allWords = loadWords();
var wordLists = coallateWordLists(allWords);
initSettings(wordLists);

