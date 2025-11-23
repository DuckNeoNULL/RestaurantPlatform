import ContractDAO, { ContractStatus } from '../dao/ContractDAO.js';
import BookingDAO from '../dao/BookingDAO.js';
import BookingStatus from '../models/enums/BookingStatus.js';
import ContractServices from '../services/ContractServices.js';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

const SIGNED_DIR = path.resolve(process.cwd(), 'server', 'uploads', 'contracts', 'signed');

async function ensureDir(dir) {
  try { await fs.mkdir(dir, { recursive: true }); } catch (e) {}
}

class ContractController {
  // Test endpoint: Generate contract from bookingID (for testing without booking/approve flow)
  static async generateTest(req, res) {
    try {
      const { bookingID } = req.body || req.query;
      if (!bookingID) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing bookingID. Provide bookingID in body or query params.' 
        });
      }

      console.log(`🔧 [ContractController] Test generating contract for bookingID: ${bookingID}`);
      
      // Check if booking exists
      const booking = await BookingDAO.getBookingDetails(Number(bookingID));
      if (!booking) {
        return res.status(404).json({ 
          success: false, 
          message: `Booking with ID ${bookingID} not found` 
        });
      }

      // Generate contract
      const result = await ContractServices.createContractFromBooking(Number(bookingID));
      
      return res.status(200).json({
        success: true,
        message: 'Contract generated successfully',
        contract: result.contract,
        filePath: result.file,
        bookingID: Number(bookingID)
      });
    } catch (e) {
      console.error('❌ [ContractController] generateTest error:', e);
      return res.status(500).json({ 
        success: false, 
        message: e?.message || e,
        error: e.stack 
      });
    }
  }

  // Get contract by ID
  static async getContract(req, res) {
    try {
      const contractID = req.params.id;
      if (!contractID) {
        return res.status(400).json({ success: false, message: 'Missing contract id' });
      }

      const contract = await ContractDAO.getByID(contractID);
      if (!contract) {
        return res.status(404).json({ success: false, message: 'Contract not found' });
      }

      return res.status(200).json({ success: true, contract });
    } catch (e) {
      console.error('getContract error:', e);
      return res.status(500).json({ success: false, message: e?.message || e });
    }
  }

  // Get contract by bookingID
  static async getContractByBooking(req, res) {
    try {
      const bookingID = req.params.bookingID;
      if (!bookingID) {
        return res.status(400).json({ success: false, message: 'Missing bookingID' });
      }

      console.log(`🔍 [getContractByBooking] Fetching contract for bookingID: ${bookingID}`);
      
      const contract = await ContractDAO.getByBookingID(Number(bookingID));
      console.log(`📄 [getContractByBooking] Contract found:`, contract ? 'YES' : 'NO');
      
      if (!contract) {
        console.log(`❌ [getContractByBooking] No contract found for bookingID ${bookingID}`);
        return res.status(404).json({ 
          success: false, 
          message: `No contract found for bookingID ${bookingID}` 
        });
      }

      console.log(`📄 [getContractByBooking] Original fileOriginalUrl:`, contract.fileOriginalUrl);

      // Handle both Cloudinary URL and local file path
      let contractUrl = contract.fileOriginalUrl;
      
      // If it's already a Cloudinary URL (starts with http/https), use it directly
      if (contractUrl && (contractUrl.startsWith('http://') || contractUrl.startsWith('https://'))) {
        console.log(`☁️ [getContractByBooking] Cloudinary URL detected:`, contractUrl);
        // No conversion needed, use as is
      } else if (contractUrl && !contractUrl.startsWith('http')) {
        // If it's a local file path, convert to URL path (backward compatibility)
        // Example: D:\...\server\uploads\contracts\contract-1.html -> /uploads/contracts/contract-1.html
        const contractsDir = path.resolve(process.cwd(), 'server', 'uploads', 'contracts');
        console.log(`📁 [getContractByBooking] Contracts dir:`, contractsDir);
        
        if (contractUrl.startsWith(contractsDir)) {
          const relativePath = contractUrl.replace(contractsDir, '').replace(/\\/g, '/');
          contractUrl = `/uploads/contracts${relativePath}`;
          console.log(`✅ [getContractByBooking] Converted to relative path:`, contractUrl);
        } else if (contractUrl.includes('uploads')) {
          // Extract path after uploads
          const match = contractUrl.match(/(uploads[/\\].*)/);
          if (match) {
            contractUrl = '/' + match[1].replace(/\\/g, '/');
            console.log(`✅ [getContractByBooking] Extracted path:`, contractUrl);
          }
        } else {
          // Try to resolve relative path
          const resolvedPath = path.resolve(process.cwd(), contractUrl);
          if (resolvedPath.includes('uploads')) {
            const match = resolvedPath.match(/(uploads[/\\].*)/);
            if (match) {
              contractUrl = '/' + match[1].replace(/\\/g, '/');
              console.log(`✅ [getContractByBooking] Resolved and extracted:`, contractUrl);
            }
          }
        }
      }
      
      console.log(`🔗 [getContractByBooking] Final contractUrl:`, contractUrl);

      return res.status(200).json({ 
        success: true, 
        contract: {
          ...contract,
          fileOriginalUrl: contractUrl
        }
      });
    } catch (e) {
      console.error('getContractByBooking error:', e);
      return res.status(500).json({ success: false, message: e?.message || e });
    }
  }

  // Serve/download contract file
  static async serveContractFile(req, res) {
    try {
      const contractID = req.params.id;
      if (!contractID) {
        return res.status(400).json({ success: false, message: 'Missing contract id' });
      }

      const contract = await ContractDAO.getByID(contractID);
      if (!contract) {
        return res.status(404).json({ success: false, message: 'Contract not found' });
      }

      let filePath = contract.fileOriginalUrl;
      console.log('📄 [serveContractFile] Original filePath from DB:', filePath);
      
      if (!filePath) {
        return res.status(404).json({ success: false, message: 'Contract file not found' });
      }

      // If it's an external URL, redirect to it
      if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        console.log('🔗 [serveContractFile] External URL, redirecting:', filePath);
        return res.redirect(filePath);
      }

      // Convert relative path to absolute path
      // If it starts with /uploads, it's a relative path from project root
      let absolutePath;
      if (filePath.startsWith('/uploads')) {
        // Relative path like /uploads/contracts/contract-1.html
        absolutePath = path.resolve(process.cwd(), 'server', filePath.replace(/^\/uploads\//, ''));
        console.log('✅ [serveContractFile] Converted relative path to absolute:', absolutePath);
      } else if (path.isAbsolute(filePath)) {
        // Already absolute path
        absolutePath = filePath;
        console.log('✅ [serveContractFile] Already absolute path:', absolutePath);
      } else {
        // Try to resolve as relative to cwd
        absolutePath = path.resolve(process.cwd(), filePath);
        console.log('✅ [serveContractFile] Resolved relative path:', absolutePath);
      }

      // Security: ensure file is within uploads directory
      const uploadsDir = path.resolve(process.cwd(), 'server', 'uploads');
      if (!absolutePath.startsWith(uploadsDir)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      // Check if file exists
      try {
        await fs.access(absolutePath);
      } catch {
        return res.status(404).json({ success: false, message: 'Contract file not found on server' });
      }

      // Determine content type
      const ext = path.extname(absolutePath).toLowerCase();
      const contentType = ext === '.pdf' 
        ? 'application/pdf' 
        : ext === '.html' 
          ? 'text/html' 
          : 'application/octet-stream';

      // Set headers for download or inline viewing
      const isDownload = req.query.download === 'true';
      res.setHeader('Content-Type', contentType);
      if (isDownload) {
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(absolutePath)}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(absolutePath)}"`);
      }

      // Stream file
      const readStream = fsSync.createReadStream(absolutePath);
      readStream.pipe(res);
    } catch (e) {
      console.error('serveContractFile error:', e);
      return res.status(500).json({ success: false, message: e?.message || e });
    }
  }

  // Customer uploads/saves signed contract (expects base64 in body.signedBase64 and optional filename)
  static async signContract(req, res) {
    try {
      const contractID = req.params.id;
      const userId = req.user?.userId;
      if (!contractID) return res.status(400).json({ success: false, message: 'Missing contract id' });

      const contract = await ContractDAO.getByID(contractID);
      if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

      const booking = await BookingDAO.getBookingById(contract.bookingID);
      if (!booking) return res.status(404).json({ success: false, message: 'Related booking not found' });

      // Only customer for this booking can sign, and only after deposit
      if (booking.customerID !== userId) return res.status(403).json({ success: false, message: 'Only booking customer can sign contract' });
      if (booking.status !== BookingStatus.DEPOSITED) return res.status(400).json({ success: false, message: 'Booking must be deposited before customer can sign' });

      const { signedBase64, filename } = req.body || {};
      if (!signedBase64) return res.status(400).json({ success: false, message: 'Missing signedBase64 in request body' });

      await ensureDir(SIGNED_DIR);
      const name = filename ? path.basename(filename) : `signed-${contractID}-${Date.now()}.pdf`;
      const filepath = path.join(SIGNED_DIR, name);
      const data = signedBase64.split(',').pop();
      const buf = Buffer.from(data, 'base64');
      await fs.writeFile(filepath, buf);

      // Update contract record: url, signedDate, status
      await ContractDAO.updateContract(contractID, { contractURL: filepath, signedDate: new Date(), status: ContractStatus.CUSTOMER_UPLOADED });

      return res.status(200).json({ success: true, message: 'Contract signed and uploaded', file: filepath });
    } catch (e) {
      console.error('signContract error', e);
      return res.status(500).json({ success: false, message: e?.message || e });
    }
  }

  // Partner upload (optional): partner can upload their signed file and set status PARTNER_UPLOADED
  static async partnerUpload(req, res) {
    try {
      const contractID = req.params.id;
      if (!contractID) return res.status(400).json({ success: false, message: 'Missing contract id' });
      const contract = await ContractDAO.getByID(contractID);
      if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

      const { signedBase64, filename } = req.body || {};
      if (!signedBase64) return res.status(400).json({ success: false, message: 'Missing signedBase64 in request body' });

      await ensureDir(SIGNED_DIR);
      const name = filename ? path.basename(filename) : `partner-signed-${contractID}-${Date.now()}.pdf`;
      const filepath = path.join(SIGNED_DIR, name);
      const data = signedBase64.split(',').pop();
      const buf = Buffer.from(data, 'base64');
      await fs.writeFile(filepath, buf);

      await ContractDAO.updateContract(contractID, { contractURL: filepath, signedDate: new Date(), status: ContractStatus.PARTNER_UPLOADED });
      return res.status(200).json({ success: true, message: 'Partner signed contract uploaded', file: filepath });
    } catch (e) {
      console.error('partnerUpload error', e);
      return res.status(500).json({ success: false, message: e?.message || e });
    }
  }
}

export default ContractController;
