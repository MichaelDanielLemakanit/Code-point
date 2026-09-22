import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface CertificatePdfOptions {
  verification_id: string;
  student_name?: string;
  course_title?: string;
  cohort?: string;
  grade?: string;
  completion_date?: string;
}

/**
 * Downloads a high-resolution, print-ready landscape A4 PDF of the certificate.
 * Uses html2canvas-pro to support modern CSS color spaces (including oklch).
 */
export async function exportCertificatePdf(
  element: HTMLElement,
  options: CertificatePdfOptions
): Promise<boolean> {
  if (!element) {
    throw new Error("Certificate DOM element not provided for PDF generation.");
  }

  const fileName = `CodePointKenya_Certificate_${options.verification_id || 'CERT'}.pdf`;

  try {
    // Resolve html2canvas-pro callable function safely
    const renderCanvas: any = 
      typeof html2canvas === 'function' 
        ? html2canvas 
        : (html2canvas as any)?.default || (html2canvas as any)?.html2canvas;

    if (typeof renderCanvas !== 'function') {
      throw new Error("html2canvas-pro renderer function unavailable");
    }

    // Render using html2canvas-pro with 2x pixel scale for high print fidelity
    const canvas = await renderCanvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#07101e',
      onclone: (clonedDoc: Document) => {
        const clonedRoot = clonedDoc.getElementById('certificate-print-root');
        if (clonedRoot) {
          clonedRoot.style.transform = 'none';
          clonedRoot.style.boxShadow = 'none';
          clonedRoot.style.maxWidth = '1000px';
          
          // Ensure student name has a solid, brilliant gold color in canvas rendering
          const nameElements = clonedRoot.querySelectorAll('.cert-student-name');
          nameElements.forEach((node) => {
            const el = node as HTMLElement;
            el.style.color = '#fef08a';
            el.style.background = 'none';
            (el.style as any).webkitTextFillColor = '#fef08a';
          });
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Landscape A4 dimensions in mm: 297 x 210
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 297;
    const pdfHeight = 210;

    // Add image fitting the landscape A4 page
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(fileName);
    return true;
  } catch (err: any) {
    console.warn("Canvas export fallback engaged:", err?.message || err);
    
    // Generate clean vector PDF directly using jsPDF as resilient fallback
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Background
      pdf.setFillColor(7, 16, 30);
      pdf.rect(0, 0, 297, 210, 'F');

      // Outer Emerald Border
      pdf.setDrawColor(5, 150, 105);
      pdf.setLineWidth(2);
      pdf.rect(10, 10, 277, 190);

      // Inner Gold Border
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.8);
      pdf.rect(14, 14, 269, 182);

      // Header Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text('CODE POINT KENYA', 148.5, 38, { align: 'center' });

      pdf.setTextColor(16, 185, 129);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI', 148.5, 45, { align: 'center' });

      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text('Nairobi Campus • Ngong Road, Teamshark 5th Floor • Accredited Tech Accelerator', 148.5, 51, { align: 'center' });

      pdf.setTextColor(251, 191, 36);
      pdf.setFont('times', 'bold');
      pdf.setFontSize(18);
      pdf.text('CERTIFICATE OF GRADUATION', 148.5, 66, { align: 'center' });

      pdf.setTextColor(148, 163, 184);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('This certificate of professional excellence is awarded to', 148.5, 80, { align: 'center' });

      // Student Name
      pdf.setTextColor(254, 240, 138);
      pdf.setFont('times', 'bolditalic');
      pdf.setFontSize(26);
      const studentName = options.student_name || 'Student Full Name';
      pdf.text(studentName, 148.5, 96, { align: 'center' });

      // Underline student name
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(0.5);
      const nameWidth = pdf.getTextWidth(studentName);
      pdf.line(148.5 - nameWidth / 2 - 5, 99, 148.5 + nameWidth / 2 + 5, 99);

      pdf.setTextColor(203, 213, 225);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('for the successful completion of the intensive professional engineering program in', 148.5, 110, { align: 'center' });

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(options.course_title || 'Full-Stack Software Engineering', 148.5, 120, { align: 'center' });

      // Details Badge
      pdf.setTextColor(52, 211, 153);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`${options.grade || 'Distinction with Honors'} • ${options.cohort || 'Cohort 14'}`, 148.5, 132, { align: 'center' });

      // Signatures
      pdf.setTextColor(254, 240, 138);
      pdf.setFont('times', 'italic');
      pdf.setFontSize(13);
      pdf.text('Ian Kiprop', 60, 162, { align: 'center' });
      pdf.text('Dr. Angela Wanjiku', 237, 162, { align: 'center' });

      pdf.setDrawColor(71, 85, 105);
      pdf.setLineWidth(0.4);
      pdf.line(35, 165, 85, 165);
      pdf.line(212, 165, 262, 165);

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('Lead Instructor & Head of Curriculum', 60, 171, { align: 'center' });
      pdf.text('Academic Director & Founder', 237, 171, { align: 'center' });

      // Official Seal in Center
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(1.2);
      pdf.circle(148.5, 160, 14);
      pdf.setTextColor(251, 191, 36);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text('VERIFIED', 148.5, 158, { align: 'center' });
      pdf.text('OFFICIAL SEAL', 148.5, 164, { align: 'center' });

      // Micro Security Footer
      pdf.setTextColor(148, 163, 184);
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(7.5);
      pdf.text(`Issued: ${options.completion_date || new Date().toLocaleDateString()}`, 20, 190);
      pdf.setTextColor(251, 191, 36);
      pdf.text(`ID: ${options.verification_id}`, 148.5, 190, { align: 'center' });
      pdf.setTextColor(52, 211, 153);
      pdf.text(`codepointkenya.com/verify?id=${options.verification_id}`, 277, 190, { align: 'right' });

      pdf.save(fileName);
      return true;
    } catch (fallbackErr) {
      console.warn("Direct PDF fallback error, triggering print:", fallbackErr);
      window.print();
      return true;
    }
  }
}
