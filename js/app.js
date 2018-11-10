angular.module('readingListApp', [])
.controller('ReadingListController', [
  '$http',
  '$scope',
  function (
    $http,
    $scope
    ) {
      window.scope = $scope;
      var verbose = false;
      
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
        log(" ");
        log("initialize function has begun. about to call getBooks()");
        getBooks();
        log("getBooks() should be done. initialization complete.");
        log(" ");
      };

      function log (argument) {
        if (verbose) {
          console.log(argument);
        }
      };

      
      function getBooks() {
        log("getBooks() has started.");
        // var spreadsheetUrl = 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=1dIssTHJjT3v3iHuQFu6zgH0gcih1T0hGBVxehrV8iJo&output=html';
        var spreadsheetKey = '1dIssTHJjT3v3iHuQFu6zgH0gcih1T0hGBVxehrV8iJo';
        log("spreadsheetKey is set to " + spreadsheetKey);

        $scope.fetchInProgress = true;
        log("initializing Tabletop. next you should hear from the callback, addBooksToPage().");
        Tabletop.init({
          key: spreadsheetKey,
          callback: addBooksToPage,
          simpleSheet: true,
          prettyColumnNames: false
        });
        log(" ");
        log("has addBooksToPage() happened yet? if not, then Tabletop’s promise is taking some time to resolve.");
        log("here’s what allBooks looks like now: ");
        log(allBooks)
        log(" ");
        
        function convertMessyTimestampToDate(book) {
          var doubleSuperExtraVerbose = false;

          !doubleSuperExtraVerbose || log(" ");
          !doubleSuperExtraVerbose || log("now in the convertMessyTimestampToDate function.");
          !doubleSuperExtraVerbose || log("current book is: ");
          !doubleSuperExtraVerbose || log(book);

          !doubleSuperExtraVerbose || log("book’s timestamp is: " + book.timestamp);
          !doubleSuperExtraVerbose || log("a new Date object based on book’s timestamp looks like: ");
          !doubleSuperExtraVerbose || log(new Date(book.timestamp));
          
          !doubleSuperExtraVerbose || log("now let’s update book’s timestamp with a new Date object");
          
          book.timestamp = new Date(book.timestamp);
          
          !doubleSuperExtraVerbose || log("all done. here is what book looks like now: ");
          !doubleSuperExtraVerbose || log(book);
          !doubleSuperExtraVerbose || log(" ");


          return book;
        }
        
        function addBooksToPage(books, tabletop) {
          log(" ");
          log("hello from addBooksToPage()! the fetch should be done.");
          $scope.fetchInProgress = false;
          log("scope.fetchInProgress is now false.");
          
          log("now setting allBooks from the books array (which is local to this function, not attached to scope).: ");

          allBooks = books;

          log(allBooks);
          
          allBooks = _.map(allBooks, convertMessyTimestampToDate);

          log("here’s allBooks with the timestamps cleand up: ");
          log(allBooks);

          $scope.$apply(function () {
            $scope.books = allBooks;
            log("attached allBooks to scope");
          });
            updateFilterCriterion();

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
        
        log("updating filterCriterion");
        
        $scope.filterCriterion = $scope.filterSliderValues[$scope.booksToShowSliderPosition]['code'];
        
        log("filterCriterion is set. Updating scope.");

        $scope.$apply(function () { log("scope is updated. hello from inside $scope.apply()!"); });

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
              var addedDate = new Date(book.timestamp);
              return addedDate > sixMonthsAgo;
            }).value();
        } else if (criterion == 'lastTwenty') {
          booksToShow = _(booksToShow)
            .filter(isAPossibleRead)
            .sortBy('Timestamp')
            .reverse()
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