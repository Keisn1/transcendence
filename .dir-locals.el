((nil . ((org-roam-directory . "~/workspace/transcendence/roam")
         (org-roam-db-location . "~/workspace/transcendence/roam/transcendence.db")))

 (org-mode . ((eval . (add-hook 'after-save-hook
                                (lambda nil
                                  (when
                                      (string-equal
                                       (file-name-nondirectory buffer-file-name)
                                       "README.org")
                                    (org-pandoc-export-to-gfm)))
                                nil t)))))

