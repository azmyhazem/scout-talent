import { Permission } from "src/Modules/permission/permission.entity";
import { DataSource } from "typeorm";

export const Permissions = [
  {
    name: "applicant:get_profile",
    description: "Get the full profile of the authenticated applicant",
    method: "GET",
  },
  {
    name: "applicant:get_basic_info",
    description: "Get basic information of the authenticated applicant",
    method: "GET",
  },
  {
    name: "applicant:get_recommended_jobs",
    description: "Get recommended jobs for the authenticated applicant",
    method: "GET",
  },
  {
    name: "applicant:get_shared_profile",
    description: "Get shareable profile link for the authenticated applicant",
    method: "GET",
  },
  {
    name: "applicant:update_basic_info",
    description: "Update basic information of the authenticated applicant",
    method: "PATCH",
  },
  {
    name: "applicant:get_profile_completion",
    description:
      "Get profile completion percentage for the authenticated applicant",
    method: "GET",
  },
  {
    name: "applicant:get_dashboard_stats",
    description: "Get dashboard statistics for the authenticated applicant",
    method: "GET",
  },
  {
    name: "applicant:delete_account",
    description: "Delete the account of the authenticated applicant",
    method: "DELETE",
  },
  {
    name: "candidate:apply_job",
    description: "Applicant applies to a job using a specific CV",
    method: "POST",
  },
  {
    name: "candidate:get_applicant_jobs_apply",
    description: "Applicant gets all their own job applications with filters",
    method: "GET",
  },
  {
    name: "candidate:get_applicant_job_apply_by_id",
    description: "Applicant gets a single job application by ID",
    method: "GET",
  },

  // ── COMPANY endpoints ────────────────────────────────────────────────────
  {
    name: "candidate:get_company_jobs_apply",
    description: "Company gets all job applications submitted to their jobs",
    method: "GET",
  },
  {
    name: "candidate:get_company_applications_by_job",
    description: "Company gets all applications for a specific job",
    method: "GET",
  },
  {
    name: "candidate:get_company_job_apply_by_id",
    description: "Company gets a single job application by ID",
    method: "GET",
  },
  {
    name: "candidate:screen_cv",
    description: "Company screens a candidate CV for a specific application",
    method: "GET",
  },
  {
    name: "candidate:reject_cv",
    description: "Company rejects a candidate application",
    method: "POST",
  },
  {
    name: "candidate:hire_cv",
    description: "Company marks a candidate application as hired",
    method: "POST",
  },
  {
    name: "candidate:interview_cv",
    description: "Company schedules an interview for a candidate application",
    method: "POST",
  },

  {
    name: "offer:respond_to_offer",
    description: "Applicant responds to a job offer (accept/reject)",
    method: "PATCH",
  },
  {
    name: "offer:get_all_by_applicant",
    description: "Applicant gets all their received job offers",
    method: "GET",
  },
  {
    name: "offer:get_all_by_company",
    description: "Company gets all job offers they have sent",
    method: "GET",
  },

  {
    name: "company:get_profile",
    description: "Get the full profile of the authenticated company",
    method: "GET",
  },
  {
    name: "company:get_shared_profile",
    description: "Get shareable profile link for the authenticated company",
    method: "GET",
  },
  {
    name: "company:get_basic_info",
    description: "Get basic information of the authenticated company",
    method: "GET",
  },
  {
    name: "company:update_basic_info",
    description: "Update basic information of the authenticated company",
    method: "PATCH",
  },
  {
    name: "company:add_or_update_about",
    description: "Add or update the About section of the authenticated company",
    method: "POST",
  },
  {
    name: "company:get_profile_completion",
    description:
      "Get profile completion percentage for the authenticated company",
    method: "GET",
  },
  {
    name: "company:get_dashboard_stats",
    description: "Get dashboard statistics for the authenticated company",
    method: "GET",
  },
  {
    name: "company:get_jobs",
    description:
      "Get all jobs posted by the authenticated company with filters",
    method: "GET",
  },
  {
    name: "company:delete_account",
    description: "Delete the account of the authenticated company",
    method: "DELETE",
  },

  {
    name: "cv:upload",
    description: "Applicant uploads a new CV file",
    method: "POST",
  },
  {
    name: "cv:set_primary",
    description: "Applicant sets a CV as their primary CV",
    method: "GET",
  },
  {
    name: "cv:download",
    description: "Applicant downloads a CV file by ID",
    method: "GET",
  },
  {
    name: "cv:view",
    description: "Applicant views/previews a CV file in the browser by ID",
    method: "GET",
  },
  {
    name: "cv:get_all",
    description: "Applicant retrieves all their uploaded CVs",
    method: "GET",
  },
  {
    name: "cv:delete",
    description: "Applicant deletes one of their uploaded CVs by ID",
    method: "DELETE",
  },

  {
    name: "experience:add",
    description: "Applicant adds a new work experience entry",
    method: "POST",
  },
  {
    name: "experience:update",
    description: "Applicant updates an existing work experience entry by ID",
    method: "PUT",
  },
  {
    name: "experience:delete",
    description: "Applicant deletes a work experience entry by ID",
    method: "DELETE",
  },

  {
    name: "interview:get_all_by_company",
    description: "Company gets all interviews associated with their account",
    method: "GET",
  },
  {
    name: "interview:complete",
    description: "Company marks an interview as completed",
    method: "POST",
  },
  {
    name: "interview:reschedule",
    description: "Company reschedules an existing interview",
    method: "PATCH",
  },
  {
    name: "interview:get_stats_by_company",
    description: "Company gets interview statistics for their account",
    method: "GET",
  },
  {
    name: "interview:get_all_by_applicant",
    description: "Applicant gets all their scheduled interviews",
    method: "GET",
  },
  {
    name: "interview:get_stats_by_applicant",
    description: "Applicant gets their interview statistics",
    method: "GET",
  },
  {
    name: "interview:cancel",
    description: "Applicant or Company cancels an interview",
    method: "POST",
  },

  {
    name: "job:create",
    description: "Company creates a new job posting",
    method: "POST",
  },
  {
    name: "job:get_recommended_candidates",
    description: "Company gets recommended candidates for a specific job",
    method: "GET",
  },
  {
    name: "job:invite_candidate",
    description: "Company invites a recommended candidate to apply for a job",
    method: "GET",
  },
  {
    name: "job:delete",
    description: "Company deletes one of their job postings by ID",
    method: "DELETE",
  },
  {
    name: "job:update",
    description: "Company updates an existing job posting by ID",
    method: "PUT",
  },
  {
    name: "job:change_status",
    description:
      "Company changes the status of a job posting (e.g. open/closed)",
    method: "POST",
  },
  {
    name: "job:get_all",
    description: "Applicant retrieves all available job postings",
    method: "GET",
  },
  {
    name: "job:get_by_id",
    description: "Get a single job posting by ID (public)",
    method: "GET",
  },

  {
    name: "skill:add",
    description: "Applicant adds a new skill to their profile",
    method: "POST",
  },
  {
    name: "skill:delete",
    description: "Applicant deletes a skill from their profile by ID",
    method: "DELETE",
  },

  {
    name: "specialization:add",
    description: "Company adds a new specialization to their profile",
    method: "POST",
  },
  {
    name: "specialization:delete",
    description: "Company deletes a specialization from their profile by ID",
    method: "DELETE",
  },
];

export async function seedApplicantPermissions(
  dataSource: DataSource,
): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);

  for (const perm of Permissions) {
    const exists = await permissionRepository.findOne({
      where: { name: perm.name },
    });
    if (!exists) {
      await permissionRepository.save(permissionRepository.create(perm));
      console.log(`✅ Created permission: ${perm.name}`);
    } else {
      console.log(`⏭️  Skipped (already exists): ${perm.name}`);
    }
  }
}
