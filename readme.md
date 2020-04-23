# MathJax-Node-Accessibility-Demo
## What it is:
A *Node.js* application that receives *HTML* combined with raw *LaTeX* syntax as an input string.   
It processes the string and returns the original *HTML* with the *LaTeX* elements converted into *SVG* and invisible *MathML*.

## Installation:
1. Make sure [Node.js](https://nodejs.org/en/) is installed on the system.   
2. Download *MathJax-Node-Accessibility-Demo* and extract it's contents. You can rename the extracted folder.   
3. Navigate into the extracted folder.   
4. If you run *MathJax-Node-Accessibility-Demo* locally you can skip this step and continue with step 5. Otherwise adjust following presets to your preffered values:   
   4.1 Open `modules/accessor.js` and adjust:   
   - the list of `apiKeys` (line 7 ff.)
 
   4.2 Open `/server.js`:   
   4.3 Adjust Port `3000` (line 19) to the port number under which *MathJax-Node-Accessibility-Demo* should be accessed.

5. You are done with configuring the presets now. *MathJax-Node-Accessibility-Demo* requires a number of *Node.js* modules in order to be executed.   To install these modules just follow the next two steps:   
   5.1 Navigate into the *MathJax-Node-Accessibility-Demo* folder with commandline (`server.js` is located in this folder).   
   5.2 Exectue the `npm install` command. This will trigger the Node Package Manager to install all required dependencies for you.   

6. Everything is set up now and the application is ready to start.   
Run `node server.js` in commandline to start the application.   
The application is now running and listening to port 3000 or to the port you specified in **4.3**   
(a process manager like [PM2](https://www.npmjs.com/package/pm2) is recommended for production use).

## Endpoints:

- /hello (**GET**)
   - Returns "hello" as string if the service is running.
- /process (**POST**)
   - Requires a valid API Key in header and *JSON* input in body.
   - Make sure that your requests body content type is set to *JSON*.
   **Input structure (body)**
      ```
      {
          language: "en",
          html: {
            "key1": "value1",
            "key2": "value2",
            "key3": "value3",
            ...
          }
      }
      ```
      `html`-attribute:
      Contains an array of strings. Each string can be a *Text*/*HTML* combined with *LaTeX* notations.
      `language`-attribute:
      Contains a string ("en"/"de") which defines the language of the `html`-attribute's values. The `language`-attribute determines the language of the output speaktext. 

      **Output structure:**
      ```
      {
          timeMS: value,
          errodCode: value,
          errorMsg: value,
          html: {
            "key1": { content: "...", errorMsg: null },
            "key2": { content: "...", errorMsg: null },
            "key3": { content: null, errorMsg: "..." },
            ...
          }
      }
      ```
      `timeMS`-attribute:    
      the value will contain information about the serverside processing time.    
      `errorMsg`-attribute:    
      the attribute will contain an error message, describing an error which occured during processing the whole package.    
      the attribute will be null if no error occured.    
      `errorCode`-attribute:    
      the attribute will contain an error code, describing an error which occured during processing the whole package.    
      the attribute will be null if no error occured.    
      `html`-attribute (null if an error occured, while processing the whole package):    
      If no error occured during processing and validating the whole package this attribute will contain a list of objects.    
      Each object represents a failed or successfull rendering of the refering *HTML*-input string.    
      Each object's key equals the key of the related *HTML*-input string.
      Each object contains a content-attribute and an errorMsg-Attribute.    
      If no error occured during rendering the related input string, the output-object's content-attribute will contain a *HTML*-string while the errorMsg-Attribute will contain a null-value.    
      If an error occured during rendering the related input string, the output-object's content-value will be set to null while the errorMsg will contain a string, describing the error.    
      If no error occured the rendered strings can be accessed with output.html.key.content....
      In this case the content string must be unescaped, e.g with decodeURI().    


## cURL Commands
#### /hello
```
curl --location --request GET '127.0.0.1:3000/hello'
```


- http://127.0.0.1 
 If run on localhost
- :3000   
  the application Port. Please refer **Installation 4.3**
- /hello   
  Process route. Please refer **Endpoints**

#### /process
```
curl -X POST \
  http://127.0.0.1:3000/process \
  -H 'API-Key: apikey' \
  -H 'Content-Type: application/json' \
  -H 'cache-control: no-cache' \
  -d '{"language":"en", "html":{"key1":"value1","key2":"value2","key3":"value3"}}'
```


- http://127.0.0.1 
 If run on localhost
- :3000   
  the application Port. Please refer **Installation 4.3**
- /process   
  Process route. Please refer **Endpoints**
- apikey   
  Your secret API Key, as defined by an administrator in `modules/accessor.js` (refer to **Installation 4.1**)
   Used to authenticate the client.
- html   
  Your escaped html content strings which will be processed individually.

## Further information:
- *LaTeX* delimiters can be `\(` and `\)` or `\[` and `\]`   
- Make sure that your requests body content type is set to *JSON*   
- Remember that the following characters are reserved for JSON and must be escaped within your requests body.   
     - Backspace is replaced with \b   
     - Form feed is replaced with \f   
     - Newline is replaced with \n   
     - Carriage return is replaced with \r   
     - Tab is replaced with \t   
     - Double quote is replaced with \\"   
     - Backslash is replaced with \\\\   

## Todos:
- Apply *TLS* support:   
Currently *TLS* is not used in this prototype. Add *TLS* support.   
- Validate requests:   
Requests from the client must be validated.   
- Prevent brute-force attacks against authorization:   
Add mechanics to limit the number of requests.
