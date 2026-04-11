import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";


export class applyJobDTO{

    @IsString()
    @ApiProperty()
    about:string
}