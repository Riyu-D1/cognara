interface FileContent {
  text: string;
  type: string;
  name: string;
  size: number;
}

export async function processFile(file: File): Promise<FileContent> {
  const content = await readFileContent(file);
  return {
    text: content,
    type: file.type,
    name: file.name,
    size: file.size
  };
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    if (file.type.startsWith('text/')) {
      reader.readAsText(file);
    } else if (file.type.startsWith('application/pdf')) {
      // TODO: Add PDF processing logic
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file type'));
    }
  });
}
