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
      
      $scope.getBooks = getBooks;
      $scope.showUnread = showUnread;
      
      initialize();
      
      ///////////
      
      function initialize() {
        getBooks().then(showUnread);
      };
      
      function getBooks() {
        var spreadsheetUrl = 'https://spreadsheets.google.com/feeds/list/1dIssTHJjT3v3iHuQFu6zgH0gcih1T0hGBVxehrV8iJo/od6/public/basic';
        
        return $http.get(spreadsheetUrl, {
          params: { alt: 'json'}
        }).then(function (response) {
          console.log('got a response from google API');
          var booksData = response.data.feed.entry;
          
          console.log('all the data: ');
          console.log(booksData);
          
          var useableBooks = _.map(booksData, parseBookData);
          
          console.log('useableBooks: ', useableBooks);
          allBooks = _.compact(useableBooks);
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
        
        _.each(detailsString.split(', '), function (pair) {
          var pieces = pair.split(': ');
          bookObject[pieces[0]] = pieces[1];
        });
        
        console.log('returning usable book object: ', bookObject);
        return bookObject;
      };
      
      function showUnread() {
        $scope.books = _.filter(allBooks, function (book) {
          return !book.read || !book.skip;
        });
      }
    }
  ]);