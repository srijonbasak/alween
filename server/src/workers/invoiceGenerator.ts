import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Order from '../models/Order';

export const streamInvoice = async (orderId: string, writeStream: NodeJS.WritableStream): Promise<void> => {
  const order = await Order.findById(orderId).populate('items.perfumeId');
  if (!order) {
    throw new Error(`Order ${orderId} not found in database.`);
  }

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  doc.pipe(writeStream);

  // Styling Constants (Luxury Palette matching White & Gold theme)
  const primaryColor = '#0C0A09'; // Deep stone-950 dark text
  const secondaryColor = '#78716C'; // Muted Stone 500 details
  const creamBg = '#FAF8F5'; // Soft warm light cream background
  const accentGold = '#AA7C11'; // Luxury Gold

  // ==========================================
  // 1. HEADER SECTION (with corporate logo)
  // ==========================================
  const logoPath = path.join(__dirname, '../../public/logo.png');
  let currentTop = 40;
  
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 40, currentTop, { width: 100 });
    
    doc.fillColor(primaryColor);
    doc.font('Helvetica-Bold').fontSize(14).text('ALWEEN LUXURY SCENTS', 320, currentTop, { align: 'right', width: 235 });
    doc.fontSize(9).fillColor(secondaryColor).text('PREMIUM MOLECULAR EXTRACTION SLIP', 320, currentTop + 18, { align: 'right', width: 235 });
    doc.fontSize(10).fillColor(primaryColor).text(`ORDER: ${order.orderNumber}`, 320, currentTop + 32, { align: 'right', width: 235 });
    doc.fontSize(8.5).fillColor(secondaryColor).text(`DATE: ${new Date(order.createdAt).toLocaleDateString()}`, 320, currentTop + 46, { align: 'right', width: 235 });
    
    currentTop += 65;
  } else {
    doc.fillColor(primaryColor);
    doc.font('Helvetica-Bold').fontSize(20).text('ALWEEN LUXURY SCENTS', 40, currentTop);
    doc.font('Helvetica').fontSize(10).fillColor(secondaryColor).text('PREMIUM MOLECULAR EXTRACTION SLIP', 40, currentTop + 24);
    doc.fontSize(10).fillColor(primaryColor).text(`ORDER: ${order.orderNumber}`, 400, currentTop, { align: 'right' });
    
    currentTop += 50;
  }

  // Top Divider line
  doc.strokeColor('#EAE5DB').lineWidth(1).moveTo(40, currentTop).lineTo(555, currentTop).stroke();
  currentTop += 15;

  // ==========================================
  // 2. THE LOGISTIC SCAN QUADRANT (Shipping details)
  // ==========================================
  const logisticsTop = currentTop;
  const addressStr = order.address.formattedAddress || 
    `${order.address.street || ''}, ${order.address.city || ''} (Postal: ${order.address.postalCode || ''})`;

  // Calculate dynamic text height to prevent any text overlap
  doc.font('Helvetica').fontSize(9.5);
  const addressHeight = doc.heightOfString(addressStr, { width: 340 });
  
  // Calculate heights dynamically
  const textVerticalSpacing = 16;
  const baseContentHeight = 65 + addressHeight;
  const geoOffset = order.geolocationAccuracy !== undefined ? 15 : 0;
  const logisticsBoxHeight = baseContentHeight + geoOffset + 25;

  // Draw background cream container
  doc.rect(40, logisticsTop, 515, logisticsBoxHeight).fill(creamBg);
  
  // Populate details inside container
  let boxY = logisticsTop + 12;
  doc.fillColor(primaryColor);
  doc.font('Helvetica-Bold').fontSize(11).text('SHIPPING & COURIER DISPATCH LOGISTICS', 50, boxY);
  boxY += 16;
  doc.fontSize(8).fillColor(secondaryColor).text('COURIER ROUTING & AUTOMATED PHYSICAL SCANNING PORT', 50, boxY);
  boxY += 12;
  
  // Thin border inside details box
  doc.strokeColor('#EAE5DB').lineWidth(0.75).moveTo(50, boxY).lineTo(545, boxY).stroke();
  boxY += 10;

  doc.fillColor(primaryColor);
  doc.font('Helvetica-Bold').fontSize(9.5).text(`CUSTOMER: ${order.customerName.toUpperCase()}`, 50, boxY);
  boxY += textVerticalSpacing;
  doc.text(`PHONE: ${order.customerPhone}`, 50, boxY);
  boxY += textVerticalSpacing + 2;

  doc.text(`SHIPPING DESTINATION:`, 50, boxY);
  doc.font('Helvetica').text(addressStr, 185, boxY, { width: 340 });
  boxY += addressHeight + 8;

  if (order.geolocationAccuracy !== undefined) {
    doc.fontSize(8).fillColor(accentGold).text(`GEOLOCATION ACCURACY MATRIX: +/-${order.geolocationAccuracy}m`, 50, boxY);
  }

  currentTop = logisticsTop + logisticsBoxHeight + 15;

  // Divider
  doc.strokeColor(primaryColor).lineWidth(1.25).moveTo(40, currentTop).lineTo(555, currentTop).stroke();
  currentTop += 15;

  // ==========================================
  // 3. THE LABORATORY MIXING GRID (Center Table)
  // ==========================================
  doc.fillColor(primaryColor);
  doc.font('Helvetica-Bold').fontSize(12).text('LABORATORY EXTRACTION & MIXING MATRIX', 40, currentTop);
  doc.font('Helvetica').fontSize(8.5).fillColor(secondaryColor)
     .text('INSTRUCTIONS: Warehouse techs must draw fluids according to formula keys plus the 3% spillage factor.', 40, currentTop + 16);

  const tableTop = currentTop + 30;
  
  // Table Header Background
  doc.rect(40, tableTop, 515, 22).fill(primaryColor);
  
  doc.fillColor('#FFFFFF');
  doc.font('Helvetica-Bold').fontSize(8);
  doc.text('SCENT NAME', 50, tableTop + 7, { width: 140 });
  doc.text('BATCH FORMULA KEY', 190, tableTop + 7, { width: 130 });
  doc.text('ORDER SIZE', 320, tableTop + 7, { width: 70 });
  doc.text('QTY', 390, tableTop + 7, { width: 30 });
  doc.text('REQUIRED FLUID EXTRACTS (ML + 3% SPILL)', 425, tableTop + 7, { width: 130 });

  // Table Rows
  let currentY = tableTop + 22;
  doc.fillColor(primaryColor);
  doc.font('Helvetica').fontSize(8.5);

  order.items.forEach((item: any, index: number) => {
    // Alternating rows background fill
    if (index % 2 === 1) {
      doc.rect(40, currentY, 515, 26).fill(creamBg);
    }
    
    doc.fillColor(primaryColor);
    doc.text(item.name, 50, currentY + 8, { width: 140 });
    doc.font('Helvetica-Bold').text(item.internalFormulaKey, 190, currentY + 8, { width: 130 });
    doc.font('Helvetica').text(`${item.selectedSizeMl} ml`, 320, currentY + 8, { width: 70 });
    doc.text(item.quantity.toString(), 390, currentY + 8, { width: 30 });

    const baseDraw = item.selectedSizeMl * item.quantity;
    const spillageFactor = 0.03;
    const spillageOffset = Number((baseDraw * spillageFactor).toFixed(2));
    const totalDraw = Number((baseDraw * (1 + spillageFactor)).toFixed(2));

    doc.font('Helvetica-Bold').fillColor(accentGold);
    doc.text(`${totalDraw} ml (${baseDraw}ml + ${spillageOffset}ml offset)`, 425, currentY + 8, { width: 130 });

    currentY += 26;
  });

  // Post table divider
  let postTableTop = currentY + 15;
  doc.strokeColor(primaryColor).lineWidth(1.25).moveTo(40, postTableTop).lineTo(555, postTableTop).stroke();
  postTableTop += 20;

  // ==========================================
  // 4. THE FINANCIAL AUDIT FOOTPRINT (Footer)
  // ==========================================
  doc.fillColor(primaryColor);
  doc.font('Helvetica-Bold').fontSize(11).text('FINANCIAL STATEMENT AUDIT', 40, postTableTop);

  const subtotal = order.subtotal;
  const discount = order.discountApplied;
  const shipping = order.shippingFee;
  const total = order.totalPrice;
  const curSymbol = 'BDT';

  let footerY = postTableTop + 18;
  doc.font('Helvetica').fontSize(9);
  
  doc.text('SUBTOTAL:', 40, footerY);
  doc.text(`${subtotal.toFixed(2)} ${curSymbol}`, 220, footerY);
  
  doc.text('DISCOUNT DEDUCTION:', 40, footerY + 12);
  doc.text(`-${discount.toFixed(2)} ${curSymbol}`, 220, footerY + 12);

  doc.text('SHIPPING CHARGES:', 40, footerY + 24);
  doc.text(`${shipping.toFixed(2)} ${curSymbol}`, 220, footerY + 24);

  doc.font('Helvetica-Bold').fontSize(11);
  doc.text('TOTAL CHARGED INVOICE:', 40, footerY + 40);
  doc.text(`${total.toFixed(2)} ${curSymbol}`, 220, footerY + 40);

  // Right side of footer - logging details
  doc.font('Helvetica').fontSize(8).fillColor(secondaryColor);
  doc.text(`ORDER NUMBER: ${order.orderNumber}`, 320, footerY);
  doc.text(`TRANSACTION ID: ${order._id}`, 320, footerY + 10);
  doc.text(`TIMESTAMP LOG: ${order.createdAt.toISOString()}`, 320, footerY + 20);
  
  if (order.couponCode) {
    doc.text(`APPLIED COUPON: ${order.couponCode}`, 320, footerY + 30);
  }
  
  if (order.affiliateId) {
    doc.font('Helvetica-Bold').fillColor(accentGold);
    doc.text(`AFFILIATE ATTRIBUTION ID: ${order.affiliateId}`, 320, footerY + 40);
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve());
    writeStream.on('error', (err) => reject(err));
    (writeStream as any).on?.('close', () => resolve());
  });
};
