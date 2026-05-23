import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getOrchestrator } from '../agents/swarm/orchestrator';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = `${uuidv4()}-${file.originalname}`;
    cb(null, unique);
  }
});

export const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

export async function startAnalysis(req: Request, res: Response) {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const documents = files?.['documents'] || [];
    const timeSheets = files?.['timeSheets'] || [];
    const depth = req.body.depth || 'standard';

    const jobId = uuidv4();
    const docPaths = documents.map(f => f.path);
    const tsPaths = timeSheets.map(f => f.path);

    const orchestrator = getOrchestrator();

    await orchestrator.startJob({
      id: jobId,
      depth,
      documentPaths: docPaths,
      timeSheetPaths: tsPaths.length > 0 ? tsPaths : undefined,
      status: 'pending',
      results: {}
    });

    res.json({
      jobId,
      documents: documents.map(f => ({
        id: uuidv4(),
        filename: f.originalname,
        fileType: f.mimetype,
        fileSize: f.size,
        status: 'uploaded'
      }))
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}