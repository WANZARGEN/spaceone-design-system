/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const files = {};
function readFiles(dirname) {
    fs.readdir(dirname, (err, filenames) => {
        if (err) {
            console.error(err);
            return;
        }
        filenames.forEach((filename, i) => {
            if (filename.endsWith('.json')) {
                fs.readFile(path.join(dirname, filename), 'utf-8', (e, content) => {
                    if (e) {
                        console.error(e);
                        return;
                    }

                    try {
                        files[filename.substring(0, filename.length - 5)] = JSON.parse(content);
                    } catch (parseErr) {
                        console.error('parseError: ', filename);
                    } finally {
                        if (i === filenames.length - 1) {
                            fs.writeFile(path.join(__dirname, '../src/molecules/lottie/lottie-files.json'),
                                JSON.stringify(files),
                                (writeError) => {
                                    if (writeError) {
                                        console.error('Write Error:', writeError);
                                    }
                                    console.log('Write Succeed: ', Object.keys(files));
                                });
                        }
                    }
                });
            }
        });
    });
}


readFiles(path.join(__dirname, '../src/assets/lottiefiles'));
