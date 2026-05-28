const fs = require('fs');

function stripColorProfile(filePath) {
    const buffer = fs.readFileSync(filePath);
    const signature = buffer.slice(0, 8);
    
    // PNG signature: 137 80 78 71 13 10 26 10
    if (signature.toString('hex') !== '89504e470d0a1a0a') {
        console.error('Not a valid PNG file:', filePath);
        return;
    }

    const newChunks = [];
    let offset = 8;
    
    while (offset < buffer.length) {
        const length = buffer.readUInt32BE(offset);
        const type = buffer.toString('ascii', offset + 4, offset + 8);
        const chunkDataLength = length + 12; // Length(4) + Type(4) + Data(Length) + CRC(4)
        
        // Chunks related to color profiles
        const badChunks = ['iCCP', 'sRGB', 'gAMA', 'cHRM'];
        
        if (!badChunks.includes(type)) {
            newChunks.push(buffer.slice(offset, offset + chunkDataLength));
        } else {
            console.log(`Stripping chunk: ${type} from ${filePath}`);
        }
        
        offset += chunkDataLength;
    }

    const newBuffer = Buffer.concat([signature, ...newChunks]);
    fs.writeFileSync(filePath, newBuffer);
    console.log(`Successfully stripped color profile from ${filePath}`);
}

const files = [
    './student-portal/public/images/student_lineart.png',
    './student-portal/public/images/admin_illustration.png'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        stripColorProfile(file);
    }
});
