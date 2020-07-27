(function() {

    angular.module('BBstatsH').factory('StorageService', ['$q', StorageService]);

    function StorageService($q) {  
        var _db;    
        var _storEntries;

        return {
            initDB: initDB,

            getAllStorage: getAllStorage,
            addStorage: addStorage,
            updateStorage: updateStorage,
            deleteStorage: deleteStorage
        };

        function initDB() {
            // Creates the database or opens if it already exists
            _db = new PouchDB('storEntries', {adapter: 'websql'});
        }

        function addStorage(storEntry) {
            return $q.when(_db.post(storEntry));
        }

        function updateStorage(storEntry) {
            return $q.when(_db.put(storEntry));
        }

        function deleteStorage(storEntry) {
            return $q.when(_db.remove(storEntry));
        }

        function getAllStorage() {

            if (!_storEntries) {
                return $q.when(_db.allDocs({ include_docs: true}))
                          .then(function(docs) {

                            // Each row has a .doc object and we just want to send an 
                            // array of Storage objects back to the calling controller,
                            // so let's map the array to contain just the .doc objects.
                            _storEntries = docs.rows.map(function(row) {
                                // Dates are not automatically converted from a string.
                                row.doc.Date = new Date(row.doc.Date);
                                return row.doc;
                            });

                            // Listen for changes on the database.
                            _db.changes({ live: true, since: 'now', include_docs: true})
                               .on('change', onDatabaseChange);

                           return _storEntries;
                         });
            } else {
                // Return cached data as a promise
                return $q.when(_storEntries);
            }
        }

        function onDatabaseChange(change) {
            var index = findIndex(_storEntries, change.id);
            var storEntry = _storEntries[index];

            if (change.deleted) {
                if (storEntry) {
                    _storEntries.splice(index, 1); // delete
                }
            } else {
                if (storEntry && storEntry._id === change.id) {
                    _storEntries[index] = change.doc; // update
                } else {
                    _storEntries.splice(index, 0, change.doc); // insert
                }
            }
        }
        
        function findIndex(array, id) {
          var low = 0, high = array.length, mid;
          while (low < high) {
            mid = (low + high) >>> 1;
            array[mid]._id < id ? low = mid + 1 : high = mid;
          }
          return low;
        }
    }
    
})();
