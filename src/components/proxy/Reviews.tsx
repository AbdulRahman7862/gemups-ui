import React from "react";
import Image, { StaticImageData } from "next/image";

export interface Review {
  user: string;
  image: StaticImageData;
  comment: string;
  rating: number;
  title: string;
  date: string;
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="p-4 rounded-lg text-white bg-[#0E1118] shadow">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-3">
        <div className="w-16 h-16 rounded-full bg-[#10141F] flex items-center justify-center shrink-0">
          <Image
            src={review.image}
            alt="Reviewer"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <span className="font-semibold text-sm">{review.user}</span>
            <div className="flex items-center gap-1 text-[#13F195] text-sm font-semibold mt-1 sm:mt-0">
              {review.rating.toFixed(1)}
              <span className="text-[#13F195]">{"★".repeat(review.rating)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1">
            <div className="text-[16px] text-[#7A8895] uppercase font-medium tracking-wide">
              {review.title}
            </div>
            <div className="text-xs text-[#7A8895] mt-1 sm:mt-0">{review.date}</div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-gray-400">Comment:</span>
            <p className="text-sm text-[#7A8895] mt-1">{review.comment}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
