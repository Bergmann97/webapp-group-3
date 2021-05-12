### Visit the [Pages of this repository](https://Bergmann97.github.io/webapp-group3/index.html) to see the projects live state

# **Description** webapp-group3
A tutorial-driven WebApp as an exam for the module 12431 Web Applications | SS 2021 at the Brandenburg Technical University. Group 3

# **Authors**
- Christian Prinz (prinzach@b-tu.de)
- Max Bergmann (bergmmax@b-tu.de)

# **Setup**
1. Clone the project:
   `git clone https://github.com/pcprinz/webapp-group3.git`
2. install [VSCode](https://code.visualstudio.com/Download)
3. open the folder in VSCode
4. Search and install the following VSCode extensions:
   - ESLint (dbaeumer.vscode-eslint)
   - Debugger for Firefox (firefox-devtools.vscode-firefox-debug)
   - [optional] SonarLint (sonarsource.sonarlint-vscode)
   - [optional] JS Refactor (cmstead.jsrefactor)
   - [optional] XML (redhat.vscode-xml)
   - [optional] HTML CSS Support (ecmel.vscode-html-css)
   - [optional] Parameter Hints (dominicvonk.parameter-hints)

   - **OR just accept the workspace reccomendations**
5. Install [Firefox Developer Edition](https://www.mozilla.org/de/firefox/developer/)

That's it.

# **Debugging with VSCode**

Debugging code allows you to go through your code line by line while running it. You can than see how the app behaves and what's happening way more detailed than you can do with `console.log`s 

## Configure
The `.vscode/launch.json` in the root folder already has a working debug configuration. In case you want to debug a different project (than `MovieDatabase_alt`) you have to change the `"file"` path to the `.../index.html` of the project you want to debug in the `"Launch index.html"` configuration (the first one).

## Start Debugging Session
1. After that you can open the Debug Tab (**CTRL + SHIFT + D**)
2. Choose `"Launch index.html"` in the drop-down menu on the top-left, if not already done.
3. Press the green Start-Symbol right beneath it.

## Debug your code
Now your Firefox Browser opens in Debug Mode.
- you can now set BreakPoints in your `.js` files by clicking on the line number on the right side (a red dot will appear)
- your app will stop at the BreakPoints.
- on the left you'll then see `VARIABLES` containing all local and global variables that are currently declared
- there is also a small control overlay appearing while debugging:
  - Continue (**F5**) continues the app until it will be stopped by the next BreakPoint
  - Step Over (**F10**) will jump to the next line of code (skipping functions)
  - Step into (**F11**) will jump into a fuction if there is one at the current position
  - Step out (**SHIFT + F11**) will jump out of the current function, continuing with the line, after the function was called.
  - Restart (**CTRL + SHIFT + F5**) restarts the app
  - Stop (**SHIFT + F5**) stops the debugging session
- The `DEBUG CONSOLE` appearing where the Terminal was before shows your console output while debugging.
- While on a BreakPoint you can hover over the variables and objects of your code and see what is currently associated to them.
