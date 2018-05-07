/**
 * Copyright 2017, Google, Inc.
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

// This file works on node v6.x and newer.
// A node v8.x version that uses async/await of this script is available
// in index.js

/*eslint node/no-unsupported-features: ["error", {version: 6}]*/

const bigtable = require('@google-cloud/bigtable');
const co = require('co');

const TABLE_NAME = 'Hello-Bigtable';
const COLUMN_FAMILY_NAME = 'cf1';
const COLUMN_NAME = 'greeting';
const INSTANCE_ID = process.env.INSTANCE_ID;

if (!INSTANCE_ID) {
  throw new Error('Environment variables for INSTANCE_ID must be set!');
}

co(function*() {
  try {
    // Create a client  
    const bigtableClient = bigtable();
    const instance = bigtableClient.instance(INSTANCE_ID);

    // Create a table
    const table = instance.table(TABLE_NAME);
    const [tableExists] = yield table.exists();
    if (!tableExists) {
      console.log(`Creating table ${TABLE_NAME}`);
      const options = {
        families: [
          {
            name: COLUMN_FAMILY_NAME,
            // GC policy: retain only the most recent 2 versions
            rule: {
              versions: 2,
            },
          },
        ],
      };
      yield table.create(options);
    }

    // Write a few rows
    console.log('Write some greetings to the table');
    const greetings = ['Hello World!', 'Hello Bigtable!', 'Hello Node!'];
    const rowsToInsert = greetings.map(function(greeting, index) {
      return {
        key: `greeting${index}`,
        data: {
          [COLUMN_FAMILY_NAME]: {
            [COLUMN_NAME]: {
              // Setting the timestamp allows the client to perform retries.
              // If server-side time is used, retries may cause multiple cells
              // to be generated.
              timestamp: new Date(),
              value: greeting,
            },
          },
        },
      };
    });
    yield table.insert(rowsToInsert);

    // Reading data from Bigtable

    // A filter that retrieves the most recent version of the cell.
    const filter = [
      {
        column: {
          cellLimit: 1, // Only retrieve the most recent version of the cell.
        },
      },
    ];

    // Read a single row using the filter
    console.log('Reading a single row by row key');
    let [singeRow] = yield table.row('greeting0').get({filter});
    const value = row.data[COLUMN_FAMILY_NAME][COLUMN_NAME][0].value;
    console.log(`\tRead: ${value}`);

    // Read the entire table using the filter
    console.log('Reading the entire table');
    const [allRows] = yield table.getRows({filter});
    for (const row of allRows) {
      const rowValue = row.data[COLUMN_FAMILY_NAME][COLUMN_NAME][0].value;
      console.log(`\tRead: ${rowValue}`);
    }

    // Delete the table
    console.log('Delete the table');
    yield table.delete();
  } catch (error) {
    console.error('Something went wrong:', error);
  }
});
