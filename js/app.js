angular.module('readingListApp', [])
.controller('ReadingListController', [
  '$http',
  '$scope',
  function (
    $http,
    $scope
    ) {
      window.scope = $scope;
      
      $scope.filterSliderValues = [
        {
          code: 'all',
          text: 'All Books'
        },
        {
          code: 'unread',
          text: 'All Unread'
        },
        {
          code: 'lastSixMonths',
          text: 'Last 6 Mo.'
        },
        {
          code: 'lastTwenty',
          text: 'Last 20 Added'
        }
      ];
      
      var allBooks = [];
      $scope.books = [];
      $scope.booksToShowSliderPosition = 3;
      $scope.sortingProperty = 'author_last';
      var queuedFilterUpdate = false;
      $scope.fetchInProgress = false;
      
      
      $scope.getBooks = getBooks;
      $scope.updateFilterCriterion = updateFilterCriterion;
      $scope.maybeUpdateFilterCriterion = maybeUpdateFilterCriterion;
      $scope.filterBooksBy = filterBooksBy;
      
      initialize();
      
      ///////////
      
      function initialize() {
        getBooks();
      };
      
      function getBooks() {
        // var spreadsheetUrl = 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=1dIssTHJjT3v3iHuQFu6zgH0gcih1T0hGBVxehrV8iJo&output=html';
        var spreadsheetKey = '1dIssTHJjT3v3iHuQFu6zgH0gcih1T0hGBVxehrV8iJo'

        $scope.fetchInProgress = true;
        Tabletop.init({
          key: spreadsheetKey,
          callback: addBooksToPage,
          simpleSheet: true
        });
        
        function addBooksToPage(books, tabletop) {
          $scope.fetchInProgress = false;
          allBooks = books;

          $scope.$apply(function () {
            $scope.books = allBooks;
            updateFilterCriterion();
          });
        }
      };
      
      function OBSOLETEobjectsFromCsv(csvString) {
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


      function maybeUpdateFilterCriterion() {
        if (!!queuedFilterUpdate) {
          queuedFilterUpdate.cancel();
        }

        queuedFilterUpdate = _.debounce(updateFilterCriterion, 500)();
      };

      function updateFilterCriterion() {
        $scope.filterCriterion = $scope.filterSliderValues[$scope.booksToShowSliderPosition]['code'];
        $scope.$apply(function () { true; });
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
          return _(booksToShow).map('$$hashKey').includes(book.$$hashKey);
        };
      }
      
      function isAPossibleRead(book) {
        return !(book.read || book.tried);
      }
    }
]);