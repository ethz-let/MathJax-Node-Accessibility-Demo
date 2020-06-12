# Mathjax Node Accessibility Demo - Testscript
## What it is:
The script will process all folders that have *input/* as direct parent and read all files within.   
The read contents will be sent to and processed by the Mathjax Node Application.   
Outputs will be written into the *output/input/* folder.   
The script will apply the rendered *LaTeX* formula + german and english speaktext to the output files.

## Goal:
The script aims to automatically process a large amount of input formula in order to receive results quickly.   
Those results contain the rendered *LaTeX* formula + german and english speaktext.   
The correctness of these values can now  be verified.

## Installation:
1. This script requires jq library. Install jq library.   
2. Create at least one folder inside *input/*.   
3. Add at least one *txt* file inside your created *input/yourfolder/* folder.   
4. Adjust line 18 and 28 (URL) in `test.sh` to match your server information.   
5. Adjust line 18 and 29 (API-Key) in `test.sh` to match your server information.   

## Use:
Run `sh test.sh` in commandline to start the script.   
The script will process all folders that have *input/* as direct parent and read all files within.   
