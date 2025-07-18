((nil . ((org-roam-directory . "~/workspace/transcendence/Notes/roam")
         (org-roam-db-location . "~/workspace/transcendence/Notes/roam/transcendence.db")))

 (org-mode . ((eval . (add-hook 'after-save-hook
                                (lambda nil
                                  (when
                                      (string-equal
                                       (file-name-nondirectory buffer-file-name)
                                       "README.org")
                                    (org-pandoc-export-to-gfm)))
                                nil t)))))

