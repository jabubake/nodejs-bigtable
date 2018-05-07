/**
 * Copyright 2018 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Imports the Google Cloud client library
const Bigtable = require('@google-cloud/bigtable');

// [START bigtable_table_ref]
const bigtableClient = bigtable();
const instance = bigtableClient.instance(INSTANCE_ID);
const table = instance.table(TABLE_NAME);
// [END bigtable_table_ref]

// [START bigtable_create_table]
const options = {
    rule: {
        versions: 2
    }
}
table.create(options, function(err, table, apiResponse) {
   if (err) {
     console.error(`Error creating table: ${error}`);
    } else {
        console.log(`Table created : ${table.id}`);
    }
});
// [END bigtable_create_table]

// [START bigtable_create_family_gc_max_age]
const maxAgeRule = {
    age: {
        // GC policy : only retain data with max age of 5 milliseconds
        seconds: 0,
        nanos: 5000
    } 
 };
// Create a column family with GC policy : maximum age
// Value must be atleast 1 millisecond
// where age = current time minus cell timestamp
const callback = function(err, family, apiResponse) {
    if (err) {
        console.error(`Error creating column family ${err}`);
    } else {
    console.log(`Created column family ${family}`);
    }
}

// Provide a callback
table.createFamily('cf1', maxAgeRule, callback);

// Return a Promise when no callback is provided
table.createFamily('cf2', maxAgeRule).then(function(data) {
    const family = data[0];
    const apiResponse = data[1];
  });
// [START bigtable_create_family_gc_max_age]

// [START bigtable_create_family_gc_max_versions]
// Create a column family with GC policy : most recent N versions
// where 1 = most recent version
const maxVersionsRule = {
    // GC policy: retain only the most recent 2 versions
    versions: 2
 };
 // Create a column family with given GC rule
table.createFamily('cf2', maxVersionsRule, callback);
 // [END bigtable_create_family_gc_max_versions]

  // [START bigtable_create_family_gc_union]
 // Create a column family with GC policy : most recent N versions or max age
 // GC rule: Drop cells older than current time + 5 milliseconds 
 //          OR beyond the most recent two versions
const unionRule = {
    versions: 2,
    age: {
        seconds: 0,
        nanos: 5000
    },
    union: true
 };

table.createFamily('cf3', maxVersionsRule, callback);
// [END bigtable_create_family_gc_union]

// [START bigtable_create_family_gc_intersect]
// GC rule: Drop cells older than current time + 5 milliseconds 
// AND beyond the most recent two versions
const intersectRule = {
    versions: 2,
    age: {
        seconds: 0,
        nanos: 5000
    },
    intersect: true
 }
table.createFamily('cf3', intersectRule, callback);
// [END bigtable_create_family_gc_intersect]

// [START bigtable_create_family_gc_ordered]
// GC rule: When union, intersect are not specified, the first predicate in the 
// rule takes effect. In this case, only the most recent two versions are retained.
const orderedRule = {
    versions: 2,
    age: {
        seconds: 0,
        nanos: 5000
    }
 }
table.createFamily('cf4', intersectRule, callback);
// [END bigtable_create_family_gc_ordered]

// [START bigtable_list_column_families]
// List all families in the table
table.getFamilies(function(err, families, apiResponse) {
    // `families` is an array of Family objects.
    if (err) {
        console.error(`Error retrieving families: ${error}`);
    } else {
        families.forEach(function(family){
            console.log(`Id: ${family.id}, Metadata: ${family.metadata}`);
          });
    }
    });
// [END bigtable_list_column_families]

// [START bigtable_delete_table]
table.create(options, function(err, table, apiResponse) {
    if (err) {
      console.error(`Error creating table: ${error}`);
     } else {
         console.log(`Table created : ${table.id}`);
     }
 });
 // [END bigtable_delete_table]

 // [START bigtable_read_error]
 table.createReadStream()
   .on('error', console.error)
   .on('data', function(row) {
      // `row` is a Row object.
    })
    .on('end', function() {
     // All rows retrieved.
    });
// [END bigtable_create_error]

 // [START bigtable_read_keys_set]
 // Read rows specifying list of non-contiguous row keys
 table.createReadStream({
    keys: [
    'key-one',
    'key-two'
    ]
}).on('error', console.error)
  .on('data', function(row) {
   // `row` is a Row object.
 })
 .on('end', function() {
  // All rows retrieved.
 });
 // [START bigtable_read_keys_set]

 // [START bigtable_read_prefix]
 // Read rows specifying a row key prefix
 table.createReadStream({
    prefix: 'keypre'
}).on('error', console.error)
  .on('data', function(row) {
   // `row` is a Row object.
 })
 .on('end', function() {
  // All rows retrieved.
 });
 // [START bigtable_read_prefix]

 // [START bigtable_read_prefix_list]
 // Read rows specifying a row key prefix
 table.createReadStream({
    prefixes: [
    'keypre1',
    'keypre2'
    ]
}).on('error', console.error)
  .on('data', function(row) {
   // `row` is a Row object.
   console.log(`Row ${row.id}: ${row.data}`);
 })
 .on('end', function() {
  // All rows retrieved.
 });
 // [START bigtable_read_prefix_list]

// [START bigtable_read_range]
// Read rows specifying a range
 table.createReadStream({
    start: 'key-1',
    end: 'key-100'
}).on('error', console.error)
  .on('data', function(row) {
   // `row` is a Row object.
   console.log(`Row ${row.id}: ${row.data}`);
 })
 .on('end', function() {
  // All rows retrieved.
 });
 // [START bigtable_read_range]

 // [START bigtable_read_multiple_ranges]
// Read rows specifying multiple ranges
table.createReadStream({
    ranges: [{
      start: 'key-1',
      end: 'key-100'
    }, {
       start: 'key-250',
       end: 'key-300'
    }]
}).on('error', console.error)
  .on('data', function(row) {
   // `row` is a Row object.
   console.log(`Row ${row.id}: ${row.data}`);
 })
 .on('end', function() {
  // All rows retrieved.
 });
 // [START bigtable_read_multiple_ranges]

// [START bigtable_read_filter]
// Read rows returning only column that matches the filter
table.createReadStream({
 // Read only the first value in the column 'key-100'
filter: [{
 column: 'key-100'
 }, {
     value: 1
  }
 ]
 }).on('error', console.error)
 .on('data', function(row) {
  // `row` is a Row object.
  console.log(`Row ${row.id}: ${row.data}`);
})
.on('end', function() {
 // All rows retrieved.
});
 // [END bigtable_read_filter]

 // [START bigtable_delete_rows_prefix]
 table.deleteRows('key-prefix', function(err, apiResponse) {
    if (err) {
        console.err(`Error deleting  rows${error}`);
    } else {
        console.log("successfully deleted rows");
    }
});
// [END bigtable_delete_rows_prefix]

// [START bigtable_delete_rows]
table.deleteRows('key-prefix', function(err, apiResponse) {
    if (err) {
        console.err(`Error deleting  rows${error}`);
    } else {
        console.log("successfully deleted rows");
    }
});
// [END bigtable_delete_rows]

// [START bigtable_delete_table]
 // Delete a table
 table.delete(function(err, apiResponse) {
    if (err) {
        console.err(`Error deleting a table ${error}`)
    } else {
        console.log(`successfully deleted a table`);
    }
});
// [END bigtable_delete_table]

// [START bigtable_check_table_exists]
 // Delete a table
 table.exists(function(err, exists) {
    if (err) {
        console.err(`Error checking if table exists ${error}`)
    } else {
        console.log(`${table.id} exists: ${exists}`);
    }
});
// [END bigtable_check_table_exists]

// [START bigtable_get_table_if_exists]
// Get a table if it exists
table.get(function(err, table, apiResponse) {
 if (err) {
   if (err.code == 5) {
   console.log("Table does not exist");
   } else {
       console.error(`Error: ${err}`);
   }
 } else {
   console.log(`Table retrieved: ${table.id}`);
 }
});
// [END bigtable_get_table_if_exists]

// [START bigtable_get_or_create_table]
// Auto-create table if does not exist
const options = {autoCreate: true};
table.get(options, function(err, table, apiResponse) {
    if (err) {
          console.error(`Error: ${err}`);
    } else {
      console.log(`Table retrieved: ${table.id}`);
    }
   });
// [END bigtable_get_or_create_table]

// [START bigtable_get_table_metadata]
// Get table metadata, and apply a view to the table fields
// Supported views include name, schema or full
// View defaults to schema if unspecified.
const options = {
  view: 'name'
}
table.getMetadata(function(err, metadata) {
  if (err) {
      console.error(`Error retrieving metadata: ${err}`);
  } else {
      console.log(`Metadata: ${metadata}`);
  }
});
// [END bigtable_get_table_metadata]

// [START bigtable_table_sample_splits]
// Creates equally sized blocks that can be used to either load 
// data to a new table or run map-reduce operations
table.sampleRowKeys(function(err, keys) {
    if (err) {
        console.error(`Error : ${err}`);
    } else {
        keys.forEach(function(key){
            console.log(`Row key: ${key.key}`);
            console.log(`Offset: ${key.offset}`);
        })
    }
});
// [START bigtable_table_sample_splits]

// [START bigtable_table_sample_splits_stream]
// Sample Row keys create equally sized blocks that can be used to either load 
// data to a new table or run map-reduce operations.
// Result is returned as a stream.
table.sampleRowKeysStream()
   .on('error', console.error)
   .on('data', function(key) {
    console.log(`Row key: ${key.key}`);
    console.log(`Offset: ${key.offset}`);
    // For premature processing, call this.end();
   })
   .on('end'), function() {
    // All sample row keys retrieved.
   };
// [END bigtable_table_sample_splits_stream]

// [START bigtable_truncate_table]
// Delete all data in the table
table.truncate(function(err, apiResponse) {
    if (err) {
        console.error(`Error deleting all data: ${err}`);
    } else {
        console.log(`${apiResponse}`);
    }
});
// [END bigtable_truncate_table]

// [START bigtable_insert_update_rows]
// Insert / update rows in a table. Each request has a limit of 4 MB
// Operation may have a partial failure.
const data = [
    { key: 'new-key',
      data: {
          'column-family-1': {
              // uses server-side timestamp by default
              'column-1-2': 10
          }
      },
      key: 'existing-key',
      data: {
          'column-family-2': {
              // (optional) override and provide a client timestamp
              timestamp: new Date('May 4, 2017'),
              'column-2-10': 20
          }
      }
    }
];

table.insert(data, function(err) {
    if (err) {
        // An API error or partial failure occurred.
        if (err.name === 'PartialFailureError') {
            err.errors.forEach(function(error) {
                console.err(`Error Code: ${error.code}`);
                console.err(`Error message: ${error.message}`);
                console.err(`Error entry: ${error.entry}`);
            });
        }
    }
});
// [END bigtable_insert_update_rows]
