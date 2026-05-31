import { useMediaUrl } from "@/hooks/useMediaUrl";
import {
	studentAvatarColor,
	studentInitials,
	type Student,
} from "@/types/student.types";

interface StudentAvatarProps {
	student: Student;
}

export function StudentAvatar({ student }: StudentAvatarProps) {
	const { url } = useMediaUrl(student.mediaFileId);
	const imageUrl = url || student.avatarUrl;

	return (
		<div
			className="student-avatar"
			style={
				imageUrl
					? undefined
					: { background: studentAvatarColor(student.id) }
			}>
			{imageUrl ? (
				<img src={imageUrl} alt={student.fullName} />
			) : (
				studentInitials(student.fullName)
			)}
		</div>
	);
}
