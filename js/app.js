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
      $scope.filterBooksBy = filterBooksBy;
      
      initialize();
      
      ///////////
      
      function initialize() {
        getBooks().then(function () {
          $scope.whichBooksToShow = 'lastTwenty';
          $scope.sortingProperty = 'author_last';
        });
      };
      
      function getBooks() {
        var spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1dIssTHJjT3v3iHuQFu6zgH0gcih1T0hGBVxehrV8iJo/pub?gid=983517851&single=true&output=csv';
        
        return $http.get(spreadsheetUrl, {
          params: { alt: 'json'}
        }).then(function (response) {
          allBooks = objectsFromCsv(response.data);
          $scope.books = allBooks;
        });
      };
      
      function objectsFromCsv(csvString) {
        var objects = csvString.split('\n');
        var keys = objects.shift().split(',');

        objects = _.map(objects, function(string) {
          var array = string.split(',');
          var object = { };
          _(array).forEach(function (value, i) {
            object[keys[i]] = array[i];
          });
          return object;
        });

        return objects;
      };


      function filterBooksBy(criterion) {
        var booksToShow = allBooks;
        
        if (criterion == 'unread') {
          booksToShow = _.filter(booksToShow, isAPossibleRead);
        } else if (criterion == 'lastSixMonths') {
          var sixMonthsAgo = new Date().setMonth(new Date().getMonth() - 6);

          booksToShow = _(booksToShow)
            .filter(isAPossibleRead)
            .filter(function (book) {
              var addedDate = new Date(book.Timestamp);
              return addedDate > sixMonthsAgo;
            }).value();
        } else if (criterion == 'lastTwenty') {
          booksToShow = _(booksToShow)
            .filter(isAPossibleRead)
            .sortBy('-Timestamp')
            .take(20)
            .value();
        }
        
        return function (book) {
          return _(booksToShow).map('$$hashKey').contains(book.$$hashKey);
        };
      }
      
      function isAPossibleRead(book) {
        return !(book.read || book.tried);
      }
    }
]);