# LogoScript
A transpiler which makes NetLogo less hideous
## Usage
First of all, [download the latest release](https://github.com/NinoDS/logoscript/releases/latest). Usage differenciates between Windows, Mac OS X and Linux.
### Windows
1. Open the LogoScript directory in cmd.exe
2. Open it in a text editor, such as VS Code
3. Create a new text file (Extension doesn't matter but I'd recommend .lgs)
4. Write your LogoScript code into that file
5. To translate your code to NetLogo, run `lsc.exe <file name> <options>`
### Linux & Mac OS X
1. Open the LogoScript directory in your terminal
2. Open it in a text editor, such as VS Code
3. Create a new text file (Extension doesn't matter but I'd recommend .lgs)
4. Write your LogoScript code into that file
5. To translate your code to NetLogo, run `lsc <file name> <options>`
## Options
Here is a List of th avaiable options:
| Option             | What it does                     |
|--------------------|----------------------------------|
| --copy             | Copy the result to the clipboard |
| --save             | Save the result to a file        |
| --supress-warnings | Suppress warnings                |
| --debug            | Enable debug mode                |
| --help             | Shows a help menu                |

Note: --copy doesn't yet work on Windows!

Developed by [NinoDS](https://github.com/NinoDS) 
