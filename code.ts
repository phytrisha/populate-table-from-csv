// This shows the HTML page in "ui.html".
figma.showUI(__html__);

interface Font {
  family: string,
  style: string
}

let textFields:any = []
let storedMsg:any
let fontsToLoad:any = []

// Load font via async function
const loadFonts = async () => {
  for (let index = 0; index < fontsToLoad.length; index++) {
    
    const fontFamily = fontsToLoad[index].family
    const fontStyle = fontsToLoad[index].style
    
    try {
      await figma.loadFontAsync({ family: fontFamily, style: fontStyle })
    } catch (error) {
      console.error("Error loading font at index " + index + ": ", error)
    }
  }
  fillFields()
}

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage =  (msg: {csvArray: string[]}) => {

  storedMsg = msg

  const main = new Promise((resolve, reject) => {
    const node = figma.currentPage.selection[0]

    if (node.type === 'FRAME') {
      textFields = node.findAllWithCriteria({
        types: ['TEXT']
      })

      for (let index = 0; index < textFields.length; index++) {

        const curFont = textFields[index].fontName

        const fontToAdd = {
          family: (curFont as Font).family,
          style: (curFont as Font).style
        }

        if (!checkIfFontExists(fontToAdd, fontsToLoad)) {
          fontsToLoad.push(fontToAdd)
        }
      }
      resolve(true)
    }
    // figma.closePlugin()
  })



  // Use font only after the Promise is resolved
  main.then(() => {
    loadFonts()
  })

}

const fillFields = () => {
  for (let index = 0; index < textFields.length; index++) {
    const element = textFields[index];
    if (storedMsg.csvArray[index] == "") {
      element.characters = " "
    } else {
      element.characters = storedMsg.csvArray[index]
    }
  }  
}

const checkIfFontExists = (currentFont: any, allFonts: any) => {
  for (let index = 0; index < allFonts.length; index++) {
    const element = allFonts[index]
    if (currentFont.family == element.family && currentFont.style == element.style) {
      return true
    }
  }
}