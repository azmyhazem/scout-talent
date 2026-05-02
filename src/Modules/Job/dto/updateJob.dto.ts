import { PartialType } from "@nestjs/swagger";
import { addJobDTO } from "./addJob.dto";

export class updateJobDTO extends PartialType(addJobDTO) {}
