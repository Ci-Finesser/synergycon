"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

type ApplicationDetailModalProps = {
  application: any
  type: "speaker" | "partnership"
  onClose: () => void
}

export function ApplicationDetailModal({ application, type, onClose }: ApplicationDetailModalProps) {
  if (!application) return null

  return (
    <Dialog open={!!application} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {type === "speaker" ? `${application.first_name} ${application.last_name}` : application.company_name}
          </DialogTitle>
          <DialogDescription>
            {type === "speaker" ? "Speaker application details" : "Partnership application details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {type === "speaker" ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Contact Information</h3>
                  <p className="text-sm text-muted-foreground">{application.email}</p>
                  <p className="text-sm text-muted-foreground">{application.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Professional Details</h3>
                  <p className="text-sm text-muted-foreground">{application.position}</p>
                  <p className="text-sm text-muted-foreground">{application.company}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.bio}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Proposed Topic</h3>
                <p className="text-sm font-medium mb-1">{application.topic_title}</p>
                <Badge className="mb-2">{application.session_type}</Badge>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.topic_description}</p>
              </div>

              {application.availability && (
                <div>
                  <h3 className="font-semibold mb-2">Availability</h3>
                  <p className="text-sm text-muted-foreground">{application.availability}</p>
                </div>
              )}

              {application.speaking_experience && (
                <div>
                  <h3 className="font-semibold mb-2">Speaking Experience</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.speaking_experience}</p>
                </div>
              )}

              {application.additional_notes && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.additional_notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                {application.linkedin && (
                  <a
                    href={application.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    LinkedIn <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {application.twitter_url && (
                  <a
                    href={application.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    Twitter <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {application.website_url && (
                  <a
                    href={application.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                  >
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Contact Person</h3>
                  <p className="text-sm text-muted-foreground">{application.contact_person}</p>
                  <p className="text-sm text-muted-foreground">{application.email}</p>
                  <p className="text-sm text-muted-foreground">{application.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Partnership Tier</h3>
                  <Badge className="mb-2">{application.partnership_tier}</Badge>
                  {application.website && (
                    <a
                      href={application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                    >
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Company Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.company_description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Partnership Interests</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.partnership_interests}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Why Partner with SynergyCon</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.why_partner}</p>
              </div>

              {application.marketing_reach && (
                <div>
                  <h3 className="font-semibold mb-2">Marketing Reach</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.marketing_reach}</p>
                </div>
              )}

              {application.additional_notes && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.additional_notes}</p>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Submitted on {new Date(application.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
