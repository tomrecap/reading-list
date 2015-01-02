angular.module('readingListApp', [])
.controller('ReadingListController', [
  '$http',
  '$scope',
  function (
    $http,
    $scope
    ) {
      window.scope = $scope;
      
      var allBooks = [];
      $scope.books = [];
      $scope.viewState = '';
      
      $scope.getBooks = getBooks;
      $scope.showAll = showAll;
      $scope.showBooksToCheckOut = showBooksToCheckOut;
      
      $scope.title = title;
      $scope.authorFirstName = authorFirstName;
      $scope.authorLastName = authorLastName;
      $scope.dateAdded = dateAdded;
      
      
      initialize();
      
      ///////////
      
      function initialize() {
        getBooks().then(showBooksToCheckOut);
      };
      
      function getBooks() {
        var spreadsheetUrl = 'https://spreadsheets.google.com/feeds/list/1dIssTHJjT3v3iHuQFu6zgH0gcih1T0hGBVxehrV8iJo/od6/public/basic';
        
        return $http.get(spreadsheetUrl, {
          params: { alt: 'json'}
        }).then(function (response) {
          console.log('got a response from google API');
          allBooks = response.data.feed.entry;
          
          console.log('all the data: ');
          console.log(allBooks);
        })
      };
      
      function parseBookData(googleBookObject) {
        console.log('parsing book object ', googleBookObject);
        var detailsString = googleBookObject.content.$t;

        if (detailsString == "skip: 0") {
          console.log('googleBookObject has no content. returning false.')
          return false;
        }

        var bookObject = {}

        bookObject.title = googleBookObject.title.$t || '';
        if (bookObject.title.substr(0,4) == 'Row:') {
          bookObject.title = '';
        }

        _.each(detailsString.split(', '), function (pair) {
          var pieces = pair.split(': ');
          bookObject[pieces[0]] = pieces[1];
        });

        bookObject.url = googleBookObject.id.$t;

        console.log('returning usable book object: ', bookObject);
        return bookObject;
      };
      
      function objectFromString(string) {
        var object = {};
        _.each(string.split(', '), function (pair) {
          var pieces = pair.split(': ');
          object[pieces[0]] = pieces[1];
        });
        return object;
      }
      
      
      
      function title(book) {
        var title = book.title.$t || '';
        if (title.substr(0,4) == 'Row:') {
          title = '';
        }
        return title;
      }

      function authorFirstName(book) {
        return objectFromString(book.content.$t).authorfirst || '';
      }

      function authorLastName(book) {
        return objectFromString(book.content.$t).authorlast || '';
      }

      function dateAdded(book) {
        return objectFromString(book.content.$t).dateadded || '';
      }
      
      function isAlreadyRead(book) {
        return !!parseInt(objectFromString(book.content.$t).read || 0);
      }

      function isAlreadyTried(book) {
        return !!parseInt(objectFromString(book.content.$t).skip || 0);
      }
      
      function isAPossibleRead(book) {
        return !(isAlreadyRead(book) || isAlreadyTried(book));
      }
      
      
      function showAll() {
        $scope.books = allBooks;
        $scope.viewState = 'all';
      }

      function showBooksToCheckOut() {
        $scope.books = _.filter(allBooks, isAPossibleRead);
        $scope.viewState = 'possibleReads';
      }
      
      function showAlreadyRead() {
        $scope.books = _.filter(allBooks, isAlreadyRead);
      }

      function showAlreadyTried() {
        $scope.books = _.filter(allBooks, isAlreadyTried);
      }

      
      function setToRead(book) {
        
      };
    }
  ]);