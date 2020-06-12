RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

#-------------------------------------------------------
# Removing old output directories
#-------------------------------------------------------

rm -rf output/input/*

#-------------------------------------------------------
# Process curls
#-------------------------------------------------------

processcurl_en() {

    input=$1
    echo "$(curl -s -X POST http://127.0.0.1:3000/process \
        -H 'API-Key: secretapikey0' \
        -H 'Content-Type: application/json' \
        -H 'cache-control: no-cache' \
        --data-raw '{"language":"en","html":{"0":'"$input"'}}')"
}

processcurl_de() {

    input=$1
    echo "$(curl -s -X POST http://127.0.0.1:3000/process \
            -H 'API-Key: secretapikey0' \
            -H 'Content-Type: application/json' \
            -H 'cache-control: no-cache' \
            --data-raw '{"language":"de","html":{"0":'"$input"'}}')"
}

#-------------------------------------------------------
# write to file
#-------------------------------------------------------

generatefile() {
    input=$1
    output_en=$2
    output_de=$3
    file=$4

    string="
        <html>
            <head></head>
            <body>
                <div id='json'></div>
                <div id='errors'></div>
                <div id='input'></div>
                <div id='output_en'></div>
                <div id='output_de'></div>
                <script>
                    generateJson = () => {
                        try {
                            data = {
                            'input': "$input",
                            'output_en': "$output_en",
                            'output_de': "$output_de"
                            };
                            document.getElementById( 'json' ).innerHTML += 'RAW Json: <textarea class=\'success\'>' + JSON.stringify(data, null, 2) + '</textarea>';
                        } catch ( error ) {
                            document.getElementById( 'json' ).innerHTML += 'RAW Json: <textarea  class=\'error\'>' + error + '</textarea>';
                        }
                    };

                    appendErrors = () => {
                        try {
                            document.getElementById('errors').innerHTML +=
                                'Error Messages:' +
                                '<div class=\'success\'>output_de.errorMsg: ' + data.output_de.errorMsg + '</div>' +
                                '<div class=\'success\'>output_de.html[0].errorMsg: ' + data.output_de.html[0].errorMsg + '</div>' +
                                '<div class=\'success\'>output_en.errorMsg: ' + data.output_en.errorMsg + '</div>' +
                                '<div class=\'success\'>output_en.html[0].errorMsg: ' + data.output_en.html[0].errorMsg;
                        } catch ( error ) {
                            document.getElementById('errors').innerHTML += 'Error Messages: <div  class=\'error\'>' + error + '</div>';
                        }
                    };

                    appendInput = () => {
                        try {
                            document.getElementById( 'input' ).innerHTML += 'Input: <textarea class=\'success\'>' + data.input + '</textarea>';
                        } catch ( error ) {
                            document.getElementById( 'input' ).innerHTML += 'Input: <div class=\'error\'>' + error + '</div>';
                        }
                    };

                    appendOutput_en = () => {
                        try {
                            document.getElementById( 'output_en' ).innerHTML += 'Output (en): <div class=\'success\'>' + data.output_en.html[0].content + '</div>';
                        } catch ( error ) {
                            document.getElementById( 'output_en' ).innerHTML += 'Output (en): <div class=\'error\'>' + error + '</div>';
                        }
                    };

                    appendOutput_de = () => {
                        try {
                            document.getElementById( 'output_de' ).innerHTML += 'Output (de): <div class=\'success\'>' + data.output_de.html[0].content + '</div>';
                        } catch ( error ) {
                            document.getElementById( 'output_de' ).innerHTML += 'Output (de): <div class=\'error\'>' + error + '</div>';
                        }
                    };

                    generateJson();
                    appendErrors();
                    appendInput();
                    appendOutput_en();
                    appendOutput_de();

                </script>
                <style>
                    textarea {
                        width: 100%;
                        height: 250px;
                    }
                    .success {
                        margin: 10px 0px 0px 0px;
                        padding: 5px;
                        border: 1px solid gray;
                        background: aliceblue;
                    }
                    .error {
                        margin: 10px 0px 0px 0px;
                        padding: 5px;
                        border: 1px solid rgba(255,0,0,1);
                        background: rgba(161,13,13,0.5);
                    }
                    .sr-only.pLatexText {
                        background: rgb(0,0,0,1);
                        color: white;
                    }
                    .mathMLFormula {
                        background: rgb(0,0,0,1);
                        color: blue;
                        display: none;
                    }
                    svg {
                        background: rgb(0,0,0,1);
                        color: yellow;
                        margin-left: 10px;
                        margin-right: 10px;
                    }
                </style>
            </body>
        </html>"

    echo "$string" > output/"$file".html
    echo -e "::: Created ${GREEN}output/""$file"".html${NC}"
}

#-------------------------------------------------------
# Display failed entries and generate ovewview file
#-------------------------------------------------------

generateoverview() {
    number=$1
    failed=$2

    echo -e "::: ==========================================="
    echo -e "::: ${GREEN}Finished generating output files${NC}"
    echo -e "::: "$number" files processed"
    echo -e "${RED}$failed${NC}"
    echo -e "$failed" > output/input/failed.txt
}

#-------------------------------------------------------
# Start reading files
#-------------------------------------------------------

echo -e "::: Start generating output files:"
echo -e "::: ==========================================="

i=0
failed="::: Failed:"

for folder in input/*
do
    for file in $folder/*
    do
        ((i++))
        echo "::: ("$i") Start: ""$file"

        mkdir -p -- "output/""$(dirname "$file")"

        input=$(<$file)
        input="${input//$'\r\n'/<br/>}"
        input="$( jq -nc --arg str "$input" '$str' )"

        if [ "$input" != "" ]; then
            output_en=$(processcurl_en "$input")
            output_de=$(processcurl_de "$input")
            generatefile "$input" "$output_en" "$output_de" "${file%.*}"
        else
            echo -e "::: Failed to read ${RED}$file${NC}"
            failed="${failed} \n::: $file"
        fi

    done
done

generateoverview "$i" "$failed"

exit 0
