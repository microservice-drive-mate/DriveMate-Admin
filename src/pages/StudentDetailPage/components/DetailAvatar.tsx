import { useMediaUrl } from "@/hooks/useMediaUrl";
import {
	studentAvatarColor,
	studentInitials,
	type Student,
} from "@/types/student.types";

interface DetailAvatarProps {
	student: Student;
}

export function DetailAvatar({ student }: DetailAvatarProps) {
	const { url } = useMediaUrl(student.mediaFileId);
	const imageUrl = url || student.avatarUrl;

	return (
		<div
			className="student-detail__avatar"
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
