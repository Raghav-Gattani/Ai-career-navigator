import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_resume_pdf(resume_data: dict, template: str = "modern") -> bytes:
    """
    Generates a professional ATS-compliant PDF with selectable vector text
    using ReportLab. Supports 'modern', 'classic', and 'minimal' styling.
    """
    buffer = io.BytesIO()
    
    # 0.5 inch margins = 36 pt
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Define color scheme based on template
    if template == "modern":
        primary_color = colors.HexColor("#00685f")
        text_color = colors.HexColor("#171d1c")
        muted_color = colors.HexColor("#585e6c")
        rule_color = colors.HexColor("#00685f")
    elif template == "minimal":
        primary_color = colors.HexColor("#2c3130")
        text_color = colors.HexColor("#2c3130")
        muted_color = colors.HexColor("#64748b")
        rule_color = colors.HexColor("#cbd5e1")
    else:  # classic
        primary_color = colors.HexColor("#000000")
        text_color = colors.HexColor("#111827")
        muted_color = colors.HexColor("#4b5563")
        rule_color = colors.HexColor("#374151")

    # Typography styles
    name_style = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=0  # Left aligned
    )

    role_style = ParagraphStyle(
        'ResumeRole',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=muted_color
    )

    contact_style = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=muted_color
    )

    heading_style = ParagraphStyle(
        'ResumeHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceAfter=3,
        textTransform='uppercase'
    )

    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=text_color
    )

    item_title_style = ParagraphStyle(
        'ResumeItemTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=text_color
    )

    item_meta_style = ParagraphStyle(
        'ResumeItemMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11.5,
        textColor=muted_color,
        alignment=2  # Right aligned
    )

    bullet_style = ParagraphStyle(
        'ResumeBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=text_color,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2
    )

    story = []

    # 1. Header / Contact Info
    personal = resume_data.get("personal_info", {})
    name = personal.get("name") or "Professional Candidate"
    role = resume_data.get("target_role") or "Software Engineer"
    
    story.append(Paragraph(name, name_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph(role, role_style))
    story.append(Spacer(1, 4))

    # Contact details row
    contacts = []
    if personal.get("email"):
        contacts.append(personal["email"])
    if personal.get("phone"):
        contacts.append(personal["phone"])
    if personal.get("location"):
        contacts.append(personal["location"])
    if personal.get("github"):
        contacts.append(personal["github"])
    if personal.get("linkedin"):
        contacts.append(personal["linkedin"])
    if personal.get("portfolio"):
        contacts.append(personal["portfolio"])

    if contacts:
        contact_line = " &nbsp;|&nbsp; ".join(contacts)
        story.append(Paragraph(contact_line, contact_style))

    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.2, color=rule_color, spaceBefore=2, spaceAfter=8))

    visibility = resume_data.get("section_visibility", {})

    # 2. Professional Summary
    summary = resume_data.get("summary")
    if summary and visibility.get("summary", True):
        story.append(Paragraph("Professional Summary", heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=rule_color, spaceBefore=1, spaceAfter=4))
        story.append(Paragraph(summary, body_style))
        story.append(Spacer(1, 8))

    # 3. Technical Skills
    skills_obj = resume_data.get("technical_skills", {})
    if skills_obj and visibility.get("skills", True):
        story.append(Paragraph("Technical Skills", heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=rule_color, spaceBefore=1, spaceAfter=4))

        skill_rows = []
        if skills_obj.get("languages"):
            skill_rows.append(f"<b>Languages:</b> {', '.join(skills_obj['languages'])}")
        if skills_obj.get("frameworks"):
            skill_rows.append(f"<b>Frameworks & Libraries:</b> {', '.join(skills_obj['frameworks'])}")
        if skills_obj.get("developer_tools"):
            skill_rows.append(f"<b>Developer Tools & Platforms:</b> {', '.join(skills_obj['developer_tools'])}")
        if skills_obj.get("core_competencies"):
            skill_rows.append(f"<b>Core Competencies:</b> {', '.join(skills_obj['core_competencies'])}")

        for s_row in skill_rows:
            story.append(Paragraph(s_row, body_style))
            story.append(Spacer(1, 1.5))
        story.append(Spacer(1, 6))

    # 4. Technical Projects
    projects = resume_data.get("projects", [])
    if projects and visibility.get("projects", True):
        story.append(Paragraph("Key Technical Projects", heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=rule_color, spaceBefore=1, spaceAfter=4))

        for proj in projects:
            title_text = f"<b>{proj.get('title', 'Project')}</b>"
            if proj.get("technologies"):
                tech_str = ", ".join(proj["technologies"]) if isinstance(proj["technologies"], list) else str(proj["technologies"])
                title_text += f" <font color='{muted_color.hexval()}'>| {tech_str}</font>"
            
            p_table = Table(
                [[Paragraph(title_text, item_title_style), Paragraph(proj.get("date", ""), item_meta_style)]],
                colWidths=[420, 120]
            )
            p_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 1),
            ]))
            story.append(p_table)

            bullets = proj.get("bullets", [])
            for b in bullets:
                story.append(Paragraph(f"&bull;&nbsp; {b}", bullet_style))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))

    # 5. Experience (if present)
    experience = resume_data.get("experience", [])
    if experience and visibility.get("experience", True):
        story.append(Paragraph("Experience & Internships", heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=rule_color, spaceBefore=1, spaceAfter=4))

        for exp in experience:
            exp_title = f"<b>{exp.get('role', '')}</b> — {exp.get('company', '')}"
            exp_table = Table(
                [[Paragraph(exp_title, item_title_style), Paragraph(exp.get("duration", ""), item_meta_style)]],
                colWidths=[420, 120]
            )
            exp_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 1),
            ]))
            story.append(exp_table)

            bullets = exp.get("bullets", [])
            for b in bullets:
                story.append(Paragraph(f"&bull;&nbsp; {b}", bullet_style))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))

    # 6. Education
    education = resume_data.get("education", [])
    if education and visibility.get("education", True):
        story.append(Paragraph("Education", heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=rule_color, spaceBefore=1, spaceAfter=4))

        for edu in education:
            degree_str = f"<b>{edu.get('degree', 'Degree')}</b> — {edu.get('institution', 'University')}"
            edu_table = Table(
                [[Paragraph(degree_str, item_title_style), Paragraph(edu.get("year", ""), item_meta_style)]],
                colWidths=[420, 120]
            )
            edu_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
                ('TOPPADDING', (0,0), (-1,-1), 0),
                ('BOTTOMPADDING', (0,0), (-1,-1), 1),
            ]))
            story.append(edu_table)
            if edu.get("details"):
                story.append(Paragraph(edu["details"], body_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 5))

    # 7. Certifications & Achievements
    certs = resume_data.get("certifications", [])
    if certs and visibility.get("certifications", True):
        story.append(Paragraph("Certifications & Verified Milestones", heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=rule_color, spaceBefore=1, spaceAfter=4))

        for c in certs:
            c_text = f"&bull;&nbsp; <b>{c.get('name', '')}</b>"
            if c.get("issuer"):
                c_text += f" — {c['issuer']}"
            if c.get("date"):
                c_text += f" ({c['date']})"
            story.append(Paragraph(c_text, bullet_style))
        story.append(Spacer(1, 4))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
