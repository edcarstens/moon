#!/pkg/python-2.7.14/el6/bin/python2.7
from __future__ import print_function
import sys
import os
import re
import argparse
import time
import textwrap

# Search order for Python modules:
# (1) current dir (.)
# (2) ./pkg
# (3) $PET_INC_PATH
# (4) $PET_INSTALL_PATH/pkg
# (5) /home/users/c33102/python/pet/pkg (if $PET_INSTALL_PATH not defined)
# (6) ~/python
# (7) follow standard Python module search order

# Add directories to python module search path
def _insertIfExists(x):
    if (os.path.exists(x)):
        sys.path.insert(0,x)
if ('PET_INSTALL_PATH' in os.environ):
    installPath = os.environ['PET_INSTALL_PATH']
else:
    installPath = '/home/users/c33102/python/pet'
if ('USER' in os.environ):
    _insertIfExists('/user/' + os.environ['USER'] + '/python')
_insertIfExists(installPath + '/pkg')
if ('PET_INC_PATH' in os.environ):
    _insertIfExists(os.environ['PET_INC_PATH'])
_insertIfExists(os.getcwd() + '/pkg')
sys.path.insert(0, os.getcwd())

# Import PET Classes
import petClasses
import petBuiltinHelp

# Argument Parser
# Workaround for -d option (between fileName and optional positional args)
debugMode = False
debugPrintExecutable = False
if ('-d' in sys.argv):
    debugMode = True
    sys.argv.remove('-d')
if ('-x' in sys.argv):
    debugMode = True
    debugPrintExecutable = True
    sys.argv.remove('-x')
parser = argparse.ArgumentParser(
    formatter_class = argparse.RawDescriptionHelpFormatter,
    description = 'Python Executable Templater (PET)',
    epilog = textwrap.dedent('''\
        Templating Procedure
        --------------------
        (1) Copy your target text file to <filename>.pet
        (2) Insert the following line as the 1st line:

         #! /apps/cad/default/python2.7/bin/python /home/users/c33102/python/pet.py
            (This procedure is necessary in order to
             facilitate capturing command line arguments
             in pet.args)

        (3) Make <filename>.pet executable:

         chmod 755 <filename>.pet

        (4) Replace any '@' characters with '@@'
        (5) If there are any lines matching the
            Python code syntax (i.e. starting with
            '///' or '//.'), consider using a different
            comment string with the -c option.
        (6) Execute the file and make sure it outputs
            exactly the same contents of the original
            target text file.
        (7) Add Python code lines and text lines with
            Python expression substitutions where desired.

        Templating Rules
        ----------------
        (1) The first line (#! ...) is used for execution
            only. It is discarded during processing.
        (2) '^  ///<codeline>'
                Python code line is immediately executed.
                Typically, this is used to include another
                PET file with pet.include(<filename>).
        (3) '^  //.  <codeline>'
                A line of Python code is appended to the
                program.

                Space preceding the '//.' indicates output
                indention. Typically, this feature is used
                when calling a function or class method to
                output a section of text all with the same
                indention.

                There are some special cases for which the
                space preceding the '//.' is ignored:
                  (a) <codeline> ends with ':{'
                      This starts a code block.
                      The '{' character is not part of
                      the generated code.
                  (b) <codeline> = '{'
                      This also starts a code block. No
                      code is generated for this line.
                  (c) <codeline> = '}'
                      This ends a code block. No code
                      is generated for this line.

                Within a code block explicitly bracketed by
                '{' and '}', the space between '//.' and
                <codeline> is ignored. PET takes care of
                the code block indention when Python code
                is generated.

                Outside of bracketed code blocks, this space
                is regarded as Python code indention.

        (4) '^<textline>'
                A print() call is appended to the program
                with a processed <textline> to enable
                substitution of Python expressions. This is
                useful when text is to be echoed as is or
                with some substitutions. If this line is
                within a code block, that code block must
                be explicitly bracketed by '{' and '}', so
                that PET can insert the proper code
                indention.

        Notes: Python expressions within two '@' characters
               in <textline> will be evaluated (to a string)
               and inserted into the template text line. '@@'
               is used to escape a '@' character.

               For info on the available builtin PET methods,
               use the -i option:

                   pet.py -i all /dev/null
               or
                   my.pet -i all

               Then for help on a specific PET method:

                   pet.py -i pet.push /dev/null
               or
                   my.pet -i pet.push

'''))

parser.add_argument('-c', default='//',
                    help = 'Sets the comment string (default: //)')
parser.add_argument('-s', default='@',
                    help = 'Sets the first Python expression delimiter (default: @)')
parser.add_argument('-e', default='@',
                    help = 'Sets the last Python expression delimiter (default: @)')
parser.add_argument('-i', default='', metavar='<func>',
                    help = 'If <func> = all, report short help info on all existing functions; otherwise, report help info on specified function. These are builtin PET methods as well as user-defined functions or class methods, called within the PET file.')
parser.add_argument('-d', action='store_true',
                    help = 'Debug mode - print generated Python code (not executable by itself)')
parser.add_argument('-x', action='store_true',
                    help = 'Debug mode - print fully executable Python code')
parser.add_argument('fileName',
                    help = 'Name of PET template file to be processed')
parser.add_argument('args', nargs='*',
                    help = 'Additional arguments passed to your PET template file in pet.args array')
args = parser.parse_args()
#print(args)

# Create the pet single inst of class petClass
pet = petClasses.petClass(globals(),args.c,args.s,args.e)
pet.debugPrintExecutable = debugPrintExecutable
pet.installPath = installPath
pet.args = args.args   # pass any additional arguments to pet
pet.info = (len(args.i) > 0)
pet.srcFile = args.fileName
petf = petClasses.petfClass(pet) # for writing files to disk
info = petClasses.infoClass(pet)  # new method for adding custom built-in help (info)
doc =  petClasses.docClass(pet, petf)
doc < info  # any lines written to info also go to doc
petBuiltinHelp.petBuiltinHelp(pet)

# First pass - generate Python code (pet.srcCode)
# PET ignores the first N lines
pet.include(args.fileName, 1)

# 2nd pass - execute Python code
if (args.d or debugMode):
    pet.printCode()
else:
    pet.printme()

# Just provide help info if -i option used
if (len(args.i) > 0):
    if (args.i == 'all'):
        for k in pet.sections:
            if (k[0:5] == 'help:'):
                pet.getHelpSectionHeader(k)
        fcts = pet.helpDict.keys()
        fcts.sort()
        for k in fcts:
            print(('{:>' + str(pet.maxFctNameLength) + '} - {}').format(k, pet.helpDict[k]))
    else:
        pet.info = False
        #print(args.i, end='')
        print(args.i)
        pet.printSection('help:' + args.i)
