try {
    const printer = require('printer');
    console.log('Printer module loaded successfully');
    console.log('Available printers:', printer.getPrinters().map(p => p.name));
} catch (e) {
    console.error('Failed to load printer module:');
    console.error(e);
}
