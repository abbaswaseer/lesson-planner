// Word lesson plan output (CLAUDE.md Section 10): one lesson per page, Arial, school layout.
import { lessonPageContent } from './docxContent.js';

const FONT = 'Arial';
const ACTIVITY_HEADINGS = [
  'Content and teacher activity',
  'Student activity',
  'Time',
  'Learning materials and resources',
  'Formative assessment',
];
// Column widths in percent; the teacher and student columns get the most room.
const ACTIVITY_WIDTHS = [28, 28, 8, 18, 18];

/**
 * Build the .docx for a set of plans.
 * @param {object[]} plans BEAMS plans.
 * @param {object} profile
 * @returns {Promise<Blob>}
 */
export async function buildDocx(plans, profile) {
  // Loaded on first use: the docx library is only needed for this output.
  const docx = await import('docx');
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType } = docx;

  const run = (text, options = {}) => new TextRun({ text, font: FONT, size: 20, ...options });
  const para = (runs, options = {}) => new Paragraph({ children: runs, spacing: { after: 60 }, ...options });
  const cell = (children, { width, shade = false } = {}) =>
    new TableCell({
      children,
      width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
      shading: shade ? { type: ShadingType.CLEAR, fill: 'E8EEF7', color: 'auto' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
    });
  const fullWidth = { size: 100, type: WidthType.PERCENTAGE };
  const labelCell = (text) => cell([para([run(text, { bold: true })])], { width: 25, shade: true });

  const pages = plans.flatMap((plan, index) => {
    const { details, activities } = lessonPageContent(plan, profile);
    const title = para([run('Lesson Plan', { bold: true, size: 28 })], { pageBreakBefore: index > 0, spacing: { after: 200 } });

    const detailsTable = new Table({
      width: fullWidth,
      rows: details.map(
        (row) =>
          new TableRow({
            children: [
              labelCell(row.label),
              cell(
                (row.paragraphs.length ? row.paragraphs : [[]]).map((runs) =>
                  para(runs.map((r) => run(r.text, { italics: r.italics })))
                ),
                { width: 75 }
              ),
            ],
          })
      ),
    });

    const activityTable = new Table({
      width: fullWidth,
      rows: [
        new TableRow({
          tableHeader: true,
          children: ACTIVITY_HEADINGS.map((heading, i) =>
            cell([para([run(heading, { bold: true })])], { width: ACTIVITY_WIDTHS[i], shade: true })
          ),
        }),
        ...activities.map(
          (row) =>
            new TableRow({
              children: [row.teacher, row.student, row.time, row.resources, row.assessment].map((text, i) =>
                cell([para([run(text ?? '')])], { width: ACTIVITY_WIDTHS[i] })
              ),
            })
        ),
      ],
    });

    // Left for the teacher to fill in by hand.
    const boxTable = (heading) =>
      new Table({
        width: fullWidth,
        rows: [
          new TableRow({ children: [cell([para([run(heading, { bold: true })])], { shade: true })] }),
          new TableRow({ children: [cell([para([]), para([]), para([])])] }),
        ],
      });

    const gap = () => para([], { spacing: { after: 160 } });
    return [
      title,
      detailsTable,
      gap(),
      activityTable,
      gap(),
      boxTable('How did you meet the individual learning needs?'),
      gap(),
      boxTable('Lesson Evaluation'),
    ];
  });

  const document = new Document({
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: pages }],
  });
  return Packer.toBlob(document);
}

/**
 * "Lesson plans week 9.docx", or one lesson's label for a single plan.
 * @param {object[]} plans
 * @returns {string}
 */
export function docxFileName(plans) {
  if (plans.length === 1) return `${String(plans[0].label).replace(/[\\/:*?"<>|]/g, '')}.docx`;
  return `Lesson plans week ${plans[0]?.cycle_id ?? ''}.docx`;
}

export default {
  id: 'docxPlan',
  name: 'Word lesson plan',
  /**
   * @param {object[]} plans
   * @param {object} profile
   * @returns {Promise<{ kind: 'file', blob: Blob, fileName: string }>}
   */
  async render(plans, profile) {
    return { kind: 'file', blob: await buildDocx(plans, profile), fileName: docxFileName(plans) };
  },
};
