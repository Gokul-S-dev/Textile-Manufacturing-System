import prisma from '../../config/db.js';
import createError from 'http-errors';

export const qualityService = {
  // Standards
  async getStandards() {
    return prisma.qualityStandard.findMany();
  },
  
  async createStandard(data) {
    return prisma.qualityStandard.create({ data });
  },

  // Inspection Plans
  async getInspectionPlans() {
    return prisma.inspectionPlan.findMany();
  },

  async createInspectionPlan(data) {
    return prisma.inspectionPlan.create({ data });
  },

  // Defect Catalogue
  async getDefects() {
    return prisma.defectCatalogue.findMany();
  },

  async createDefect(data) {
    return prisma.defectCatalogue.create({ data });
  },

  // Inspections
  async getInspections(query) {
    return prisma.inspectionRecord.findMany({
      include: {
        plan: true,
        batch: true,
        run: true,
        measurements: true,
        defects: { include: { defect: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async createInspection(data) {
    // Determine mandatory inspections based on batch or run
    return prisma.inspectionRecord.create({ data });
  },

  async startInspection(id, inspectorId) {
    return prisma.inspectionRecord.update({
      where: { id },
      data: {
        inspectorId,
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });
  },

  async recordResults(id, data) {
    const { measurements, defects } = data;
    
    return prisma.$transaction(async (tx) => {
      // Create Measurements
      if (measurements && measurements.length > 0) {
        for (const m of measurements) {
          // Compare against standard dynamically
          const standard = await tx.qualityStandard.findUnique({ where: { id: m.standardId } });
          let isPassed = true;
          
          if (standard.minVal && m.recordedValue < standard.minVal) isPassed = false;
          if (standard.maxVal && m.recordedValue > standard.maxVal) isPassed = false;

          await tx.inspectionMeasurement.create({
            data: {
              recordId: id,
              standardId: m.standardId,
              recordedValue: m.recordedValue,
              categoricalValue: m.categoricalValue,
              isPassed
            }
          });
        }
      }

      // Create Defects
      if (defects && defects.length > 0) {
        for (const d of defects) {
          await tx.observedDefect.create({
            data: {
              recordId: id,
              defectId: d.defectId,
              quantity: d.quantity,
              location: d.location,
              inspectorNotes: d.inspectorNotes
            }
          });
        }
      }
      
      return { success: true };
    });
  },

  async completeInspection(id) {
    // Calculate overall outcome
    const measurements = await prisma.inspectionMeasurement.findMany({ where: { recordId: id } });
    const defects = await prisma.observedDefect.findMany({ where: { recordId: id }, include: { defect: true } });

    let outcome = 'PASSED';
    let status = 'PASSED';
    
    if (measurements.some(m => !m.isPassed)) {
      outcome = 'FAILED';
      status = 'FAILED';
    }

    // Critical defects trigger immediate ON_HOLD
    if (defects.some(d => d.defect.severity === 'CRITICAL')) {
      outcome = 'ON_HOLD';
      status = 'ON_HOLD';
    } else if (defects.length > 0) {
      outcome = 'FAILED'; // or requires review
      status = 'FAILED';
    }

    const inspection = await prisma.inspectionRecord.update({
      where: { id },
      data: {
        overallOutcome: outcome,
        status,
        completionTime: new Date()
      }
    });

    // Integrated lock: If a batch fails or is put on hold, update its MES status
    if (inspection.batchId && (status === 'FAILED' || status === 'ON_HOLD')) {
      await prisma.productionBatch.update({
        where: { id: inspection.batchId },
        data: { status: 'ON_HOLD' }
      });
    }

    return inspection;
  },

  async submitDisposition(id, data) {
    const { status, comments } = data; // E.g. manual override or rework
    return prisma.inspectionRecord.update({
      where: { id },
      data: {
        status,
        inspectorComments: comments
      }
    });
  },

  // Rework
  async createRework(data) {
    return prisma.reworkRecord.create({ data });
  },

  async updateRework(id, data) {
    return prisma.reworkRecord.update({ where: { id }, data });
  },

  // CAPA
  async getCAPA() {
    return prisma.cAPARecord.findMany();
  },
  
  async createCAPA(data) {
    return prisma.cAPARecord.create({ data });
  },

  // Reports
  async getSummary() {
    const total = await prisma.inspectionRecord.count();
    const passed = await prisma.inspectionRecord.count({ where: { overallOutcome: 'PASSED' } });
    const failed = await prisma.inspectionRecord.count({ where: { overallOutcome: 'FAILED' } });
    
    return {
      totalInspections: total,
      passed,
      failed,
      firstPassYield: total > 0 ? (passed / total) * 100 : 100
    };
  }
};
